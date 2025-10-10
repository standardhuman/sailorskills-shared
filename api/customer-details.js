/**
 * API Endpoint: Get Customer Details from Supabase
 * GET /api/customer-details?stripeCustomerId=xxx
 *
 * Returns customer, boat, and address data from PostgreSQL
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

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

    const { stripeCustomerId, email } = req.query;

    if (!stripeCustomerId && !email) {
        return res.status(400).json({ error: 'stripeCustomerId or email is required' });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        let customer = null;

        // Try to get customer by Stripe customer ID first
        if (stripeCustomerId) {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('stripe_customer_id', stripeCustomerId)
                .maybeSingle();

            if (!error && data) {
                customer = data;
            }
        }

        // If not found and email provided, try to find by email
        if (!customer && email) {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('email', email)
                .maybeSingle();

            if (!error && data) {
                customer = data;
            }
        }

        if (!customer) {
            // Customer not found - return empty data
            return res.status(200).json({
                found: false,
                customer: null,
                boats: [],
                addresses: []
            });
        }

        // Get boats for this customer
        // Note: marina is a text column in boats table, not a foreign key
        console.log('Fetching boats for customer_id:', customer.id);
        const { data: boats, error: boatsError } = await supabase
            .from('boats')
            .select('*')
            .eq('customer_id', customer.id);

        if (boatsError) {
            console.error('Error fetching boats:', boatsError);
            console.error('Boats error details:', JSON.stringify(boatsError));
        } else {
            console.log('Boats query result:', boats ? `${boats.length} boats found` : 'null');
        }

        // Get addresses for this customer
        const { data: addresses, error: addressesError } = await supabase
            .from('addresses')
            .select('*')
            .eq('customer_id', customer.id);

        if (addressesError) {
            console.error('Error fetching addresses:', addressesError);
        }

        return res.status(200).json({
            found: true,
            customer,
            boats: boats || [],
            addresses: addresses || []
        });

    } catch (error) {
        console.error('Error fetching customer details:', error);
        return res.status(500).json({
            error: 'Failed to fetch customer details',
            details: error.message
        });
    }
}
