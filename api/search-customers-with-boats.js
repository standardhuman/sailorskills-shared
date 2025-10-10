/**
 * API Endpoint: Search Customers with Boats
 * GET /api/search-customers-with-boats?search=query
 *
 * Searches Stripe customers and expands each customer by their boats
 * Returns one result per boat (not per customer)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

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

    const { search } = req.query;

    if (!search || search.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    try {
        console.log('🔍 Searching customers with boats for:', search);

        const supabase = createClient(supabaseUrl, supabaseKey);
        const searchLower = search.toLowerCase();
        const results = [];
        const processedCustomerBoats = new Set(); // Track customer+boat combos to avoid duplicates

        // Step 1: Search Stripe customers by name/email (with payment method expansion)
        const query = `email~'${searchLower}' OR name~'${searchLower}'`;
        const url = `https://api.stripe.com/v1/customers/search?query=${encodeURIComponent(query)}&limit=20&expand[]=data.invoice_settings.default_payment_method`;

        const stripeResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                'Stripe-Version': '2024-06-20',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!stripeResponse.ok) {
            const errorData = await stripeResponse.json();
            throw new Error(errorData.error?.message || 'Stripe API error');
        }

        const stripeData = await stripeResponse.json();
        console.log(`✅ Found ${stripeData.data.length} Stripe customers from Stripe`);

        // Step 2: Search boats by name in Supabase
        const { data: boatMatches } = await supabase
            .from('boats')
            .select('*, customers!inner(*)')
            .or(`name.ilike.%${search}%,make.ilike.%${search}%,model.ilike.%${search}%`);

        console.log(`✅ Found ${boatMatches?.length || 0} boats matching search`);

        // Step 3: Process Stripe customer matches

        // Helper function to add a result
        const addResult = (customer, supabaseCustomer, boat = null) => {
            const key = `${customer.id}-${boat?.id || 'no-boat'}`;
            if (processedCustomerBoats.has(key)) return; // Skip duplicates
            processedCustomerBoats.add(key);

            // Get payment methods from customer object
            const paymentMethods = customer.invoice_settings?.default_payment_method
                ? [customer.invoice_settings.default_payment_method]
                : [];

            if (boat) {
                results.push({
                    id: customer.id,
                    name: customer.name || customer.email || 'Unknown',
                    email: customer.email || '',
                    phone: customer.phone || supabaseCustomer?.phone || '',
                    boat_id: boat.id,
                    boat_name: boat.name || '',
                    boat_length: boat.length || '',
                    boat_make: boat.make || '',
                    boat_model: boat.model || '',
                    boat_type: boat.type || '',
                    hull_type: boat.hull_type || '',
                    has_twin_engines: boat.has_twin_engines || false,
                    marina: boat.marina || '',
                    dock: boat.dock || '',
                    slip: boat.slip || '',
                    has_supabase_data: true,
                    payment_methods: paymentMethods
                });
            } else {
                results.push({
                    id: customer.id,
                    name: customer.name || customer.email || 'Unknown',
                    email: customer.email || '',
                    phone: customer.phone || supabaseCustomer?.phone || '',
                    boat_name: customer.metadata?.boat_name || '',
                    boat_length: customer.metadata?.boat_length || '',
                    boat_make: customer.metadata?.boat_make || '',
                    boat_model: customer.metadata?.boat_model || '',
                    marina: customer.metadata?.marina || '',
                    dock: customer.metadata?.dock || '',
                    slip: customer.metadata?.slip || '',
                    has_supabase_data: false,
                    payment_methods: paymentMethods
                });
            }
        };

        // Process Stripe customer matches
        for (const customer of stripeData.data) {
            const { data: supabaseCustomer } = await supabase
                .from('customers')
                .select('*')
                .or(`stripe_customer_id.eq.${customer.id},email.eq.${customer.email}`)
                .maybeSingle();

            if (supabaseCustomer) {
                const { data: boats } = await supabase
                    .from('boats')
                    .select('*')
                    .eq('customer_id', supabaseCustomer.id);

                console.log(`  👤 ${customer.name}: ${boats?.length || 0} boats`);

                if (boats && boats.length > 0) {
                    boats.forEach(boat => addResult(customer, supabaseCustomer, boat));
                } else {
                    addResult(customer, supabaseCustomer, null);
                }
            } else {
                addResult(customer, null, null);
            }
        }

        // Process boat name matches from Supabase
        if (boatMatches && boatMatches.length > 0) {
            for (const match of boatMatches) {
                const boat = match;
                const supabaseCustomer = match.customers;

                // Find or create Stripe customer for this boat owner
                if (supabaseCustomer.stripe_customer_id) {
                    // Get full customer data from Stripe with payment method
                    const stripeCustomerUrl = `https://api.stripe.com/v1/customers/${supabaseCustomer.stripe_customer_id}?expand[]=invoice_settings.default_payment_method`;
                    const stripeCustomerResponse = await fetch(stripeCustomerUrl, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                            'Stripe-Version': '2024-06-20'
                        }
                    });

                    if (stripeCustomerResponse.ok) {
                        const stripeCustomer = await stripeCustomerResponse.json();
                        addResult(stripeCustomer, supabaseCustomer, boat);
                        console.log(`  🚤 Found boat "${boat.name}" for ${stripeCustomer.name}`);
                    }
                }
            }
        }

        console.log(`🎯 Returning ${results.length} total results (including boats)`);
        return res.status(200).json(results);

    } catch (error) {
        console.error('❌ Error searching customers with boats:', error);

        return res.status(500).json({
            error: 'Failed to search customers',
            details: error.message
        });
    }
}
