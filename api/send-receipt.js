/**
 * API Endpoint: Send Email Receipt
 * POST /api/send-receipt
 *
 * Sends an email receipt to customer after successful payment using Resend
 */

import { Resend } from 'resend';

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
            customerEmail,
            customerName,
            amount,
            serviceName,
            boatName,
            boatLength,
            paymentIntentId,
            chargeId,
            serviceDate
        } = req.body;

        // Validate required fields
        if (!customerEmail || !customerName || !amount) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'customerEmail, customerName, and amount are required'
            });
        }

        if (!process.env.RESEND_API_KEY) {
            console.error('❌ RESEND_API_KEY not configured');
            return res.status(500).json({
                error: 'Email service not configured',
                details: 'RESEND_API_KEY environment variable is missing'
            });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        // Use EMAIL_FROM_ADDRESS from env or fallback
        const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'Sailor Skills <noreply@sailorskills.com>';

        // Format the service date
        const formattedDate = serviceDate
            ? new Date(serviceDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

        // Create email HTML
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - Sailor Skills</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Payment Receipt</h1>
                            <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">Sailor Skills Marine Services</p>
                        </td>
                    </tr>

                    <!-- Success Checkmark -->
                    <tr>
                        <td style="padding: 30px 40px 20px; text-align: center;">
                            <div style="width: 80px; height: 80px; margin: 0 auto; background-color: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <h2 style="margin: 20px 0 10px; color: #16a34a; font-size: 24px;">Payment Successful</h2>
                            <p style="margin: 0; color: #6b7280; font-size: 14px;">Thank you for your payment!</p>
                        </td>
                    </tr>

                    <!-- Amount -->
                    <tr>
                        <td style="padding: 0 40px 30px; text-align: center;">
                            <div style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                                <p style="margin: 0 0 5px; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Amount Charged</p>
                                <p style="margin: 0; color: #111827; font-size: 40px; font-weight: 700;">$${amount.toFixed(2)}</p>
                            </div>
                        </td>
                    </tr>

                    <!-- Details -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table width="100%" cellpadding="8" cellspacing="0">
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                        <p style="margin: 0; color: #6b7280; font-size: 14px;">Customer</p>
                                    </td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                        <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 600;">${customerName}</p>
                                    </td>
                                </tr>
                                ${boatName ? `
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                        <p style="margin: 0; color: #6b7280; font-size: 14px;">Boat</p>
                                    </td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                        <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 600;">${boatName}${boatLength ? ` (${boatLength} ft)` : ''}</p>
                                    </td>
                                </tr>
                                ` : ''}
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                        <p style="margin: 0; color: #6b7280; font-size: 14px;">Service</p>
                                    </td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                        <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 600;">${serviceName || 'Service Charge'}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                        <p style="margin: 0; color: #6b7280; font-size: 14px;">Date</p>
                                    </td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                        <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 600;">${formattedDate}</p>
                                    </td>
                                </tr>
                                ${paymentIntentId ? `
                                <tr>
                                    <td style="padding: 12px 0;">
                                        <p style="margin: 0; color: #6b7280; font-size: 14px;">Payment ID</p>
                                    </td>
                                    <td style="padding: 12px 0; text-align: right;">
                                        <p style="margin: 0; color: #6b7280; font-size: 12px; font-family: monospace;">${paymentIntentId}</p>
                                    </td>
                                </tr>
                                ` : ''}
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Questions about this payment?</p>
                            <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 600;">Contact us at <a href="mailto:info@sailorskills.com" style="color: #3b82f6; text-decoration: none;">info@sailorskills.com</a></p>
                            <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} Sailor Skills Marine Services. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        // Send email using Resend
        console.log(`📧 Sending receipt to ${customerEmail} for $${amount}`);

        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: [customerEmail],
            subject: `Payment Receipt - $${amount.toFixed(2)} - Sailor Skills`,
            html: emailHtml,
        });

        if (error) {
            console.error('❌ Resend error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to send email',
                details: error.message
            });
        }

        console.log('✅ Email sent successfully:', data?.id);

        return res.status(200).json({
            success: true,
            message: 'Receipt email sent successfully',
            emailId: data?.id
        });

    } catch (error) {
        console.error('❌ Error sending receipt:', error);

        return res.status(500).json({
            success: false,
            error: 'Failed to send receipt email',
            details: error.message
        });
    }
}
