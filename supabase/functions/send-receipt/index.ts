/**
 * Supabase Edge Function: Send Email Receipt
 * POST /functions/v1/send-receipt
 *
 * Sends an email receipt to customer after successful payment using Resend
 * and logs the email to the database for audit trail
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Email receipt interface
interface ReceiptData {
  customerEmail: string;
  customerName: string;
  amount: number;
  serviceName?: string;
  boatName?: string;
  boatLength?: string;
  paymentIntentId?: string;
  chargeId?: string;
  serviceDate?: string;
  serviceLogId?: string;
}

serve(async (req: Request) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    // Parse request body
    const data: ReceiptData = await req.json();
    const {
      customerEmail,
      customerName,
      amount,
      serviceName,
      boatName,
      boatLength,
      paymentIntentId,
      chargeId,
      serviceDate,
      serviceLogId,
    } = data;

    // Validate required fields
    if (!customerEmail || !customerName || !amount) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          details: "customerEmail, customerName, and amount are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get environment variables
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const emailFromAddress = Deno.env.get("EMAIL_FROM_ADDRESS") ||
      "Sailor Skills <noreply@sailorskills.com>";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!resendApiKey) {
      console.error("❌ RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({
          error: "Email service not configured",
          details: "RESEND_API_KEY environment variable is missing",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      supabaseUrl!,
      supabaseServiceRoleKey!
    );

    // Format the service date
    const formattedDate = serviceDate
      ? new Date(serviceDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    // Create email HTML (same professional template from Vercel function)
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
                                ${
      boatName
        ? `
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                        <p style="margin: 0; color: #6b7280; font-size: 14px;">Boat</p>
                                    </td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                        <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 600;">${boatName}${
          boatLength ? ` (${boatLength} ft)` : ""
        }</p>
                                    </td>
                                </tr>
                                `
        : ""
    }
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                        <p style="margin: 0; color: #6b7280; font-size: 14px;">Service</p>
                                    </td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                        <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 600;">${
      serviceName || "Service Charge"
    }</p>
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
                                ${
      paymentIntentId
        ? `
                                <tr>
                                    <td style="padding: 12px 0;">
                                        <p style="margin: 0; color: #6b7280; font-size: 14px;">Payment ID</p>
                                    </td>
                                    <td style="padding: 12px 0; text-align: right;">
                                        <p style="margin: 0; color: #6b7280; font-size: 12px; font-family: monospace;">${paymentIntentId}</p>
                                    </td>
                                </tr>
                                `
        : ""
    }
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Questions about this payment?</p>
                            <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 600;">Contact us at <a href="mailto:info@sailorskills.com" style="color: #3b82f6; text-decoration: none;">info@sailorskills.com</a></p>
                            <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px;">© ${
      new Date().getFullYear()
    } Sailor Skills Marine Services. All rights reserved.</p>
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

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFromAddress,
        to: [customerEmail],
        subject: `Payment Receipt - $${amount.toFixed(2)} - Sailor Skills`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("❌ Resend error:", resendData);

      // Log failed email to database
      await supabase.from("email_logs").insert([{
        email_type: "receipt",
        recipient_email: customerEmail,
        recipient_name: customerName,
        subject: `Payment Receipt - $${amount.toFixed(2)} - Sailor Skills`,
        status: "failed",
        error_message: resendData.message || "Unknown error",
        payment_intent_id: paymentIntentId,
        charge_id: chargeId,
        service_log_id: serviceLogId,
        metadata: {
          amount,
          serviceName,
          boatName,
          boatLength,
        },
      }]);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to send email",
          details: resendData.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Email sent successfully:", resendData.id);

    // Log successful email to database
    const { data: emailLog, error: emailLogError } = await supabase
      .from("email_logs")
      .insert([{
        email_type: "receipt",
        recipient_email: customerEmail,
        recipient_name: customerName,
        subject: `Payment Receipt - $${amount.toFixed(2)} - Sailor Skills`,
        status: "sent",
        resend_id: resendData.id,
        payment_intent_id: paymentIntentId,
        charge_id: chargeId,
        service_log_id: serviceLogId,
        metadata: {
          amount,
          serviceName,
          boatName,
          boatLength,
        },
      }])
      .select()
      .single();

    if (emailLogError) {
      console.error("⚠️ Failed to log email to database:", emailLogError);
    }

    // Update service log if provided
    if (serviceLogId && emailLog) {
      await supabase
        .from("service_logs")
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
          email_log_id: emailLog.id,
        })
        .eq("id", serviceLogId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Receipt email sent successfully",
        emailId: resendData.id,
        emailLogId: emailLog?.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("❌ Error sending receipt:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to send receipt email",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
