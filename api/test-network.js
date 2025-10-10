/**
 * Test network connectivity to Stripe API
 */

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        // Try to reach Stripe's API directly with fetch
        const response = await fetch('https://api.stripe.com/v1/customers', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = await response.json();

        return res.status(200).json({
            success: true,
            statusCode: response.status,
            hasData: !!data
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            name: error.name,
            cause: error.cause?.message
        });
    }
}
