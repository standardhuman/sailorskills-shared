/**
 * Email Notification Service
 * Handles sending emails for order notifications
 */

import { formatEmailDate, formatCurrency, escapeHtml, renderTemplate } from './template-helpers.js';

// Supabase configuration
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://fzygakldvvzxmahkdylq.supabase.co';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/send-notification`;

/**
 * Call Supabase Edge Function to send email
 * @param {string} emailType - Type of email to send
 * @param {object} payload - Email payload
 * @returns {Promise<object>} Response with success, emailId, emailLogId
 */
async function callEmailEdgeFunction(emailType, payload) {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env?.VITE_SUPABASE_ANON_KEY || ''}`,
      },
      body: JSON.stringify({
        emailType,
        ...payload
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Email edge function error:', error);
    throw error;
  }
}

/**
 * Handle email errors
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @returns {object} User-friendly error response
 */
function handleEmailError(error, context) {
  console.error(`❌ Email error in ${context}:`, error);
  return {
    success: false,
    error: error.message || 'Failed to send email',
    context
  };
}

/**
 * Load email template
 * @param {string} templateName - Template filename without extension
 * @returns {Promise<string>} Template HTML
 */
async function loadTemplate(templateName) {
  try {
    // For production builds, templates will be bundled
    // For development, load from file system
    const response = await fetch(`/shared/src/email/templates/${templateName}.html`);
    if (!response.ok) {
      throw new Error(`Template not found: ${templateName}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Failed to load template ${templateName}:`, error);
    throw error;
  }
}

/**
 * Send order confirmation email to customer
 * @param {object} orderData - Order details
 * @param {string} orderData.orderId - Order UUID
 * @param {string} orderData.customerEmail - Customer email address
 * @param {string} orderData.customerName - Customer full name
 * @param {string} orderData.boatName - Boat name
 * @param {string|number} orderData.boatLength - Boat length in feet
 * @param {Date|string} orderData.scheduledDate - Scheduled service date
 * @param {string} orderData.serviceType - Type of service
 * @param {number} orderData.estimatedAmount - Estimated cost
 * @param {string} orderData.marina - Marina name
 * @param {string} orderData.marinaAddress - Marina address (optional)
 * @param {string} orderData.notes - Additional notes (optional)
 * @returns {Promise<object>} Response with success, emailId, emailLogId
 */
export async function sendOrderConfirmation(orderData) {
  try {
    console.log('📧 Sending order confirmation email...');

    // Load template
    const template = await loadTemplate('order-confirmation');

    // Prepare template data
    const templateData = {
      customerName: escapeHtml(orderData.customerName),
      boatName: escapeHtml(orderData.boatName),
      boatLength: orderData.boatLength,
      scheduledDate: formatEmailDate(orderData.scheduledDate),
      serviceType: escapeHtml(orderData.serviceType),
      marinaName: escapeHtml(orderData.marina),
      estimatedAmount: formatCurrency(orderData.estimatedAmount),
      currentYear: new Date().getFullYear()
    };

    // Render HTML
    const htmlContent = renderTemplate(template, templateData);

    // Build payload
    const payload = {
      recipientEmail: orderData.customerEmail,
      recipientName: orderData.customerName,
      subject: `Service Scheduled - ${orderData.boatName} - Sailor Skills`,
      htmlContent,
      metadata: {
        boatName: orderData.boatName,
        scheduledDate: orderData.scheduledDate,
        serviceType: orderData.serviceType,
        estimatedAmount: orderData.estimatedAmount
      },
      orderId: orderData.orderId
    };

    // Send via edge function
    const result = await callEmailEdgeFunction('order_confirmation', payload);

    console.log('✅ Order confirmation email sent:', result.emailId);
    return result;

  } catch (error) {
    return handleEmailError(error, 'sendOrderConfirmation');
  }
}

export async function sendOrderDeclined(orderData) {
  // TODO: Implement in Task 4
  throw new Error('Not implemented yet');
}

export async function sendNewOrderAlert(orderData) {
  // TODO: Implement in Task 5
  throw new Error('Not implemented yet');
}

export async function sendOrderStatusUpdate(orderData) {
  // TODO: Implement in Task 6
  throw new Error('Not implemented yet');
}
