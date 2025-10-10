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

        // Step 1: Search Stripe customers
        const searchLower = search.toLowerCase();
        // Note: Stripe only supports ':' (exact match) for metadata, not '~' (partial match)
        const query = `email~'${searchLower}' OR name~'${searchLower}'`;
        const url = `https://api.stripe.com/v1/customers/search?query=${encodeURIComponent(query)}&limit=20`;

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
        console.log(`✅ Found ${stripeData.data.length} Stripe customers`);

        // Step 2: For each customer, get their boats from Supabase
        const supabase = createClient(supabaseUrl, supabaseKey);
        const results = [];

        for (const customer of stripeData.data) {
            // Get customer from Supabase by Stripe ID or email
            const { data: supabaseCustomer } = await supabase
                .from('customers')
                .select('*')
                .or(`stripe_customer_id.eq.${customer.id},email.eq.${customer.email}`)
                .maybeSingle();

            if (supabaseCustomer) {
                // Get boats for this customer
                const { data: boats } = await supabase
                    .from('boats')
                    .select('*')
                    .eq('customer_id', supabaseCustomer.id);

                console.log(`  👤 ${customer.name}: ${boats?.length || 0} boats`);

                if (boats && boats.length > 0) {
                    // Create one result per boat
                    boats.forEach(boat => {
                        results.push({
                            // Customer info from Stripe
                            id: customer.id,
                            name: customer.name || customer.email || 'Unknown',
                            email: customer.email || '',
                            phone: customer.phone || supabaseCustomer.phone || '',

                            // Boat info from Supabase
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

                            // Mark that this has Supabase data
                            has_supabase_data: true
                        });
                    });
                } else {
                    // Customer has no boats - still show them with Stripe metadata
                    results.push({
                        id: customer.id,
                        name: customer.name || customer.email || 'Unknown',
                        email: customer.email || '',
                        phone: customer.phone || supabaseCustomer.phone || '',
                        boat_name: customer.metadata?.boat_name || '',
                        boat_length: customer.metadata?.boat_length || '',
                        boat_make: customer.metadata?.boat_make || '',
                        boat_model: customer.metadata?.boat_model || '',
                        marina: customer.metadata?.marina || '',
                        dock: customer.metadata?.dock || '',
                        slip: customer.metadata?.slip || '',
                        has_supabase_data: false
                    });
                }
            } else {
                // Customer not in Supabase - use Stripe metadata
                results.push({
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
                    has_supabase_data: false
                });
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
