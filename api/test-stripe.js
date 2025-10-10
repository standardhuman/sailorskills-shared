/**
 * Test endpoint to verify Stripe connection
 */

import Stripe from 'stripe';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const stripeKey = process.env.STRIPE_SECRET_KEY;

        if (!stripeKey) {
            return res.status(500).json({ error: 'STRIPE_SECRET_KEY not set' });
        }

        // Check key format
        if (!stripeKey.startsWith('sk_')) {
            return res.status(500).json({ error: 'Invalid Stripe key format', keyStart: stripeKey.substring(0, 10) });
        }

        console.log('Initializing Stripe...');
        const stripe = new Stripe(stripeKey, {
            timeout: 60000, // 60 second timeout
            maxNetworkRetries: 0 // Disable retries for faster failure
        });

        console.log('Listing customers...');
        const customers = await stripe.customers.list({ limit: 1 });

        return res.status(200).json({
            success: true,
            count: customers.data.length,
            hasMore: customers.has_more
        });

    } catch (error) {
        console.error('Stripe test error:', error);
        return res.status(500).json({
            error: error.message,
            type: error.type,
            code: error.code
        });
    }
}
