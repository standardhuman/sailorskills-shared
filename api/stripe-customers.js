/**
 * API Endpoint: Search Stripe Customers
 * GET /api/stripe-customers?search=query
 *
 * Searches Stripe customers by name, email, or metadata (boat name)
 * Used by universal search box on admin.html
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    const { search } = req.query;

    if (!search || search.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    try {
        console.log('Searching Stripe customers for:', search);

        // Search customers by email or name
        const customers = await stripe.customers.search({
            query: `email~'${search}' OR name~'${search}'`,
            limit: 20
        });

        console.log(`Found ${customers.data.length} customers`);

        // Format customer data for frontend
        const formattedCustomers = customers.data.map(customer => ({
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

        // Handle Stripe API errors gracefully
        if (error.type === 'StripeInvalidRequestError') {
            return res.status(400).json({
                error: 'Invalid search query',
                details: error.message
            });
        }

        return res.status(500).json({
            error: 'Failed to search customers',
            details: error.message
        });
    }
}
