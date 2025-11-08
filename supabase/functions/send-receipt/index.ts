/**
 * Supabase Edge Function: Send Email Receipt
 * POST /functions/v1/send-receipt
 *
 * Sends an email receipt to customer after successful payment using Resend
 * NOW LOADS TEMPLATES FROM SETTINGS DATABASE (with fallback to inline)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM_EMAIL = Deno.env.get('EMAIL_FROM_ADDRESS') || 'Sailor Skills <noreply@sailorskills.com>';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

interface EmailTemplate {
  subject: string;
  html: string;
}

// Initialize Supabase client for loading templates
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Load template from Settings database
 */
async function loadTemplateFromDatabase(data: any): Promise<EmailTemplate | null> {
  try {
    const { data: template, error } = await supabase
      .from('email_templates')
      .select('subject_line, html_template_file')
      .eq('template_key', 'payment_receipt')
      .eq('is_active', true)
      .single();

    if (error || !template) {
      console.warn(`Template payment_receipt not found in database:`, error);
      return null;
    }

    // Perform variable substitution
    let subject = template.subject_line;
    let html = template.html_template_file;

    // Replace all {{variable}} placeholders with actual data
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      const value = data[key] !== null && data[key] !== undefined ? String(data[key]) : '';
      subject = subject.replace(regex, value);
      html = html.replace(regex, value);
    });

    return { subject, html };
  } catch (error) {
    console.error(`Error loading template:`, error);
    return null;
  }
}

/**
 * FALLBACK TEMPLATE (used if database is unavailable)
 */
function getFallbackTemplate(data: any): EmailTemplate {
  const amount = data.amount;
  const customerName = data.customerName;
  const boatName = data.boatName;
  const boatLength = data.boatLength;
  const serviceName = data.serviceName;
  const formattedDate = data.serviceDate;
  const paymentIntentId = data.paymentIntentId;
  const currentYear = data.currentYear;

  return {
    subject: `Payment Receipt - $${amount} - Sailor Skills`,
    html: `<!DOCTYPE html>
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
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Payment Receipt</h1>
                            <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">Sailor Skills Marine Services</p>
                        </td>
                    </tr>
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
                    <tr>
                        <td style="padding: 0 40px 30px; text-align: center;">
                            <div style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                                <p style="margin: 0 0 5px; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Amount Charged</p>
                                <p style="margin: 0; color: #111827; font-size: 40px; font-weight: 700;">$${amount}</p>
                            </div>
                        </td>
                    </tr>
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
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Questions about this payment?</p>
                            <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 600;">Contact us at <a href="mailto:info@sailorskills.com" style="color: #3b82f6; text-decoration: none;">info@sailorskills.com</a></p>
                            <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px;">© ${currentYear} Sailor Skills Marine Services. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
  };
}

/**
 * Get template (try database first, fallback to inline)
 */
async function getTemplate(data: any): Promise<EmailTemplate> {
  console.log(`Loading template: payment_receipt`);

  // Try loading from database first
  const dbTemplate = await loadTemplateFromDatabase(data);

  if (dbTemplate) {
    console.log('✅ Loaded template from database: payment_receipt');
    return dbTemplate;
  }

  // Fallback to inline template
  console.log('⚠️ Using fallback template for: payment_receipt');
  return getFallbackTemplate(data);
}

/**
 * Send email via Resend API
 */
async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Resend API error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
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
    const rawData: ReceiptData = await req.json();
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
    } = rawData;

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

    if (!RESEND_API_KEY) {
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

    // Prepare template data with fallback values for optional fields
    const templateData = {
      amount: amount.toFixed(2),
      customerName: customerName,
      boatName: boatName || 'N/A',
      boatLength: boatLength || '',
      serviceName: serviceName || 'Service Charge',
      serviceDate: formattedDate,
      paymentIntentId: paymentIntentId || 'N/A',
      currentYear: new Date().getFullYear().toString()
    };

    // Get template (database or fallback)
    const template = await getTemplate(templateData);

    // Send email
    const result = await sendEmail(customerEmail, template.subject, template.html);

    if (!result.success) {
      // Log failed email to database
      await supabase.from("email_logs").insert([{
        email_type: "receipt",
        recipient_email: customerEmail,
        recipient_name: customerName,
        subject: template.subject,
        status: "failed",
        error_message: result.error || "Unknown error",
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
          details: result.error,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Email sent successfully:", result.id);

    // Log successful email to database
    const { data: emailLog, error: emailLogError } = await supabase
      .from("email_logs")
      .insert([{
        email_type: "receipt",
        recipient_email: customerEmail,
        recipient_name: customerName,
        subject: template.subject,
        status: "sent",
        resend_id: result.id,
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
        emailId: result.id,
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
