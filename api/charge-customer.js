/**
 * API Endpoint: Charge Customer
 * POST /api/charge-customer
 *
 * Charges a customer using their saved payment method or a provided payment method
 */

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
        const { customerId, amount, description, metadata, paymentMethodId } = req.body;

        // Validate required fields
        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID is required' });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        console.log(`💳 Charging customer ${customerId} for $${amount / 100}`);

        // Step 1: Get customer's default payment method if not provided
        let paymentMethod = paymentMethodId;

        if (!paymentMethod) {
            console.log('No payment method provided, fetching customer default...');

            const customerResponse = await fetch(
                `https://api.stripe.com/v1/customers/${customerId}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                        'Stripe-Version': '2024-06-20'
                    }
                }
            );

            if (!customerResponse.ok) {
                const error = await customerResponse.json();
                throw new Error(error.error?.message || 'Failed to fetch customer');
            }

            const customer = await customerResponse.json();
            paymentMethod = customer.invoice_settings?.default_payment_method;

            if (!paymentMethod) {
                return res.status(400).json({
                    error: 'No payment method found for customer',
                    details: 'Customer has no default payment method. Please add a payment method first.'
                });
            }

            console.log(`✅ Using customer's default payment method: ${paymentMethod}`);
        }

        // Step 2: Create Payment Intent
        console.log('Creating Payment Intent...');

        const paymentIntentData = new URLSearchParams({
            amount: amount.toString(),
            currency: 'usd',
            customer: customerId,
            payment_method: paymentMethod,
            confirm: 'true', // Automatically confirm the payment
            description: description || 'Service Charge',
            'automatic_payment_methods[enabled]': 'true',
            'automatic_payment_methods[allow_redirects]': 'never'
        });

        // Add metadata if provided
        if (metadata && typeof metadata === 'object') {
            Object.keys(metadata).forEach(key => {
                // Stripe metadata values must be strings
                const value = typeof metadata[key] === 'string'
                    ? metadata[key]
                    : JSON.stringify(metadata[key]);
                paymentIntentData.append(`metadata[${key}]`, value);
            });
        }

        const paymentIntentResponse = await fetch(
            'https://api.stripe.com/v1/payment_intents',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                    'Stripe-Version': '2024-06-20',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: paymentIntentData.toString()
            }
        );

        if (!paymentIntentResponse.ok) {
            const error = await paymentIntentResponse.json();
            console.error('❌ Payment Intent creation failed:', error);
            throw new Error(error.error?.message || 'Failed to create payment intent');
        }

        const paymentIntent = await paymentIntentResponse.json();

        // Step 3: Check payment status
        if (paymentIntent.status === 'succeeded') {
            console.log(`✅ Payment successful! PaymentIntent: ${paymentIntent.id}`);

            return res.status(200).json({
                success: true,
                paymentIntent: {
                    id: paymentIntent.id,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    status: paymentIntent.status,
                    created: paymentIntent.created
                },
                chargeId: paymentIntent.latest_charge,
                message: `Successfully charged $${amount / 100} to customer`
            });
        } else if (paymentIntent.status === 'requires_action') {
            // 3D Secure or other authentication required
            console.log('⚠️ Payment requires additional authentication');

            return res.status(200).json({
                success: false,
                requiresAction: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntent: {
                    id: paymentIntent.id,
                    status: paymentIntent.status
                },
                message: 'Payment requires additional authentication'
            });
        } else {
            // Payment failed or in unexpected state
            console.error(`❌ Payment failed with status: ${paymentIntent.status}`);

            return res.status(400).json({
                success: false,
                error: 'Payment failed',
                details: paymentIntent.last_payment_error?.message || `Payment status: ${paymentIntent.status}`
            });
        }

    } catch (error) {
        console.error('❌ Error charging customer:', error);

        return res.status(500).json({
            success: false,
            error: 'Failed to charge customer',
            details: error.message
        });
    }
}
