/**
 * API Endpoint: Get Service Logs
 * GET /api/service-logs?boatId=xxx or ?customerId=xxx
 *
 * Returns service condition logs for Portal to display
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Source');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { boatId, customerId, limit = 50, offset = 0 } = req.query;

    if (!boatId && !customerId) {
        return res.status(400).json({ error: 'Either boatId or customerId is required' });
    }

    try {
        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Build query
        let query = supabase
            .from('service_conditions_log')
            .select('*')
            .order('service_date', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        // Filter by boat_id or customer_id
        if (boatId) {
            query = query.eq('boat_id', boatId);
        } else {
            query = query.eq('customer_id', customerId);
        }

        const { data: logs, error, count } = await query;

        if (error) {
            console.error('Error fetching service logs:', error);
            return res.status(500).json({ error: 'Failed to fetch service logs', details: error.message });
        }

        return res.status(200).json({
            success: true,
            logs: logs || [],
            count: logs ? logs.length : 0,
            total: count
        });

    } catch (error) {
        console.error('Error in service-logs API:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
