/**
 * API Endpoint: Search Stripe Customers or Fetch Single Customer with Payment Methods
 * GET /api/stripe-customers?search=query
 * GET /api/stripe-customers?customerId=cus_XXX
 *
 * Searches Stripe customers by name, email, or metadata (boat name)
 * OR fetches a single customer with payment methods
 * Uses direct HTTP fetch instead of Stripe SDK (due to Vercel compatibility)
 */

export const config = {
    runtime: 'nodejs'
};

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { search, customerId } = req.query;

    // Mode 1: Fetch single customer by ID with payment methods
    if (customerId) {
        try {
            console.log('Fetching Stripe customer:', customerId);

            // Fetch customer from Stripe
            const customerResponse = await fetch(
                `https://api.stripe.com/v1/customers/${customerId}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                        'Stripe-Version': '2024-06-20'
                    }
                }
            );

            if (!customerResponse.ok) {
                const error = await customerResponse.json();
                throw new Error(error.error?.message || 'Failed to fetch customer');
            }

            const customer = await customerResponse.json();

            // Fetch payment methods for this customer
            const pmResponse = await fetch(
                `https://api.stripe.com/v1/payment_methods?customer=${customerId}&type=card`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                        'Stripe-Version': '2024-06-20'
                    }
                }
            );

            const paymentMethodsData = pmResponse.ok ? await pmResponse.json() : { data: [] };
            const paymentMethods = paymentMethodsData.data || [];

            console.log(`✅ Found ${paymentMethods.length} payment methods for ${customerId}`);

            // Return customer with payment_methods array (not paymentMethods)
            return res.status(200).json({
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                payment_methods: paymentMethods.map(pm => ({
                    id: pm.id,
                    type: pm.type,
                    card: pm.card || {}
                }))
            });

        } catch (error) {
            console.error('Error fetching customer:', error);
            return res.status(500).json({
                error: 'Failed to fetch customer',
                details: error.message
            });
        }
    }

    // Mode 2: Search customers
    if (!search || search.length < 2) {
        return res.status(400).json({ error: 'Search query or customerId is required' });
    }

    try {
        console.log('Searching Stripe customers for:', search);

        // Search customers using direct API call
        // Use lowercase for case-insensitive search
        const searchLower = search.toLowerCase();
        const query = `email~'${searchLower}' OR name~'${searchLower}' OR metadata['boat_name']~'${searchLower}'`;
        const url = `https://api.stripe.com/v1/customers/search?query=${encodeURIComponent(query)}&limit=20`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                'Stripe-Version': '2024-06-20', // Use a modern API version that supports search
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Stripe API error');
        }

        const data = await response.json();
        console.log(`Found ${data.data.length} customers`);

        // Format customer data for frontend
        const formattedCustomers = data.data.map(customer => ({
            id: customer.id,
            name: customer.name || customer.email || 'Unknown',
            email: customer.email || '',
            phone: customer.phone || '',
            boat_name: customer.metadata?.boat_name || '',
            boat_length: customer.metadata?.boat_length || '',
            boat_make: customer.metadata?.boat_make || '',
            boat_model: customer.metadata?.boat_model || '',
            marina: customer.metadata?.marina || '',
            dock: customer.metadata?.dock || '',
            slip: customer.metadata?.slip || '',
            description: customer.description || ''
        }));

        return res.status(200).json(formattedCustomers);

    } catch (error) {
        console.error('Error searching Stripe customers:', error);

        return res.status(500).json({
            error: 'Failed to search customers',
            details: error.message
        });
    }
}
