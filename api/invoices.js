/**
 * API Endpoint: Create Invoice
 * POST /api/invoices
 *
 * Creates an invoice for a customer without a payment method on file
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

    const {
        customerId,
        serviceId,
        boatId,
        amount,
        customerDetails,
        boatDetails,
        serviceDetails,
        notes,
        dueInDays = 30
    } = req.body;

    // Validate required fields
    if (!customerId) {
        return res.status(400).json({ error: 'customerId is required' });
    }

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid amount is required' });
    }

    try {
        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Step 1: Generate invoice number using database function
        const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
            .rpc('generate_invoice_number');

        if (invoiceNumberError) {
            console.error('Error generating invoice number:', invoiceNumberError);
            return res.status(500).json({
                error: 'Failed to generate invoice number',
                details: invoiceNumberError.message
            });
        }

        const invoiceNumber = invoiceNumberData;
        console.log(`📄 Generated invoice number: ${invoiceNumber}`);

        // Step 2: Calculate due date
        const issuedAt = new Date();
        const dueAt = new Date(issuedAt);
        dueAt.setDate(dueAt.getDate() + dueInDays);

        // Step 3: Insert invoice into database
        const { data: invoice, error: insertError } = await supabase
            .from('invoices')
            .insert({
                invoice_number: invoiceNumber,
                customer_id: customerId,
                service_id: serviceId || null,
                boat_id: boatId || null,
                amount: amount,
                currency: 'usd',
                status: 'pending',
                issued_at: issuedAt.toISOString(),
                due_at: dueAt.toISOString(),
                customer_details: customerDetails || {},
                boat_details: boatDetails || {},
                service_details: serviceDetails || {},
                notes: notes || null,
                email_sent: false
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating invoice:', insertError);
            return res.status(500).json({
                error: 'Failed to create invoice',
                details: insertError.message
            });
        }

        console.log(`✅ Invoice created: ${invoice.invoice_number} (ID: ${invoice.id})`);

        return res.status(200).json({
            success: true,
            invoice: invoice,
            message: `Invoice ${invoice.invoice_number} created successfully`
        });

    } catch (error) {
        console.error('Error in invoices API:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
