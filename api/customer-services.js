/**
 * API Endpoint: Get Customer Services
 * GET /api/customer-services?customerId=xxx
 *
 * Returns list of active recurring services for a customer
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

    const { customerId } = req.query;

    if (!customerId) {
        return res.status(400).json({ error: 'customerId is required' });
    }

    try {
        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch active services for the customer
        const { data: services, error } = await supabase
            .from('customer_services')
            .select('*')
            .eq('customer_id', customerId)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching customer services:', error);
            return res.status(500).json({ error: 'Failed to fetch customer services', details: error.message });
        }

        return res.status(200).json({
            success: true,
            services: services || [],
            count: services ? services.length : 0
        });

    } catch (error) {
        console.error('Error in customer-services API:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
