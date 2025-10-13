/**
 * API Endpoint: Save Service Log
 * POST /api/save-service-log
 *
 * Saves service charge information to database for Portal access
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
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            customerId,
            boatId,
            serviceType,
            serviceName,
            serviceDate,
            serviceTime,
            amountCharged,
            paymentIntentId,
            chargeId,
            serviceDetails
        } = req.body;

        // Validate required fields
        if (!customerId || !serviceType || !amountCharged) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'customerId, serviceType, and amountCharged are required'
            });
        }

        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Prepare service log data
        const serviceLog = {
            customer_id: customerId,
            boat_id: boatId || null,
            service_type: serviceType,
            service_name: serviceName || serviceType.replace(/_/g, ' '),
            service_date: serviceDate || new Date().toISOString().split('T')[0],
            service_time: serviceTime || new Date().toTimeString().split(' ')[0],
            amount_charged: parseFloat(amountCharged),
            payment_intent_id: paymentIntentId || null,
            charge_id: chargeId || null,
            service_details: serviceDetails || {}
        };

        console.log('📝 Saving service log:', serviceLog);

        // Insert into service_logs table
        const { data, error } = await supabase
            .from('service_logs')
            .insert([serviceLog])
            .select()
            .single();

        if (error) {
            console.error('❌ Error saving service log:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to save service log',
                details: error.message
            });
        }

        console.log('✅ Service log saved successfully:', data.id);

        return res.status(200).json({
            success: true,
            message: 'Service log saved successfully',
            serviceLogId: data.id,
            data: data
        });

    } catch (error) {
        console.error('❌ Error in save-service-log API:', error);

        return res.status(500).json({
            success: false,
            error: 'Failed to save service log',
            details: error.message
        });
    }
}
