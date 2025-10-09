/**
 * API Endpoint: Save Service Conditions
 * POST /api/save-conditions
 *
 * Saves service condition data for Portal to access
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        customer_id,
        boat_id,
        service_id,
        order_id,
        service_type,
        service_name,
        service_date,
        service_time,
        paint_condition_overall,
        growth_level,
        anode_conditions,
        anodes_installed,
        thru_hull_condition,
        thru_hull_notes,
        propeller_1_condition,
        propeller_2_condition,
        propeller_notes,
        time_in,
        time_out,
        notes,
        photos,
        created_by
    } = req.body;

    if (!customer_id || !service_type) {
        return res.status(400).json({ error: 'customer_id and service_type are required' });
    }

    try {
        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Insert condition log
        const { data, error } = await supabase
            .from('service_conditions_log')
            .insert({
                customer_id,
                boat_id,
                service_id,
                order_id,
                service_type,
                service_name,
                service_date: service_date || new Date().toISOString().split('T')[0],
                service_time,
                paint_condition_overall,
                growth_level,
                anode_conditions: anode_conditions || [],
                anodes_installed: anodes_installed || [],
                thru_hull_condition,
                thru_hull_notes,
                propeller_1_condition,
                propeller_2_condition,
                propeller_notes,
                time_in,
                time_out,
                notes,
                photos: photos || [],
                created_by: created_by || 'billing_system'
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving conditions:', error);
            return res.status(500).json({ error: 'Failed to save conditions', details: error.message });
        }

        return res.status(200).json({
            success: true,
            condition_log_id: data.id,
            message: 'Conditions saved successfully'
        });

    } catch (error) {
        console.error('Error in save-conditions API:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
