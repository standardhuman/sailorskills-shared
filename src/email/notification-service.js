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

/**
 * Send order declined email to customer
 * @param {object} orderData - Order details
 * @param {string} orderData.orderId - Order UUID
 * @param {string} orderData.customerEmail - Customer email address
 * @param {string} orderData.customerName - Customer full name
 * @param {string} orderData.boatName - Boat name
 * @param {string} orderData.serviceType - Type of service
 * @param {string} orderData.declineReason - Reason for declining
 * @param {string} orderData.alternativeSuggestion - What customer should do next (optional)
 * @returns {Promise<object>} Response with success, emailId, emailLogId
 */
export async function sendOrderDeclined(orderData) {
  try {
    console.log('📧 Sending order declined email...');

    // Load template
    const template = await loadTemplate('order-declined');

    // Prepare template data
    const templateData = {
      customerName: escapeHtml(orderData.customerName),
      boatName: escapeHtml(orderData.boatName),
      serviceType: escapeHtml(orderData.serviceType),
      declineReason: escapeHtml(orderData.declineReason || 'Scheduling conflict or capacity constraint'),
      alternativeSuggestion: escapeHtml(orderData.alternativeSuggestion || 'Please contact us to discuss alternative scheduling options or different service arrangements.'),
      currentYear: new Date().getFullYear()
    };

    // Render HTML
    const htmlContent = renderTemplate(template, templateData);

    // Build payload
    const payload = {
      recipientEmail: orderData.customerEmail,
      recipientName: orderData.customerName,
      subject: `Service Request Update - ${orderData.boatName} - Sailor Skills`,
      htmlContent,
      metadata: {
        boatName: orderData.boatName,
        serviceType: orderData.serviceType,
        declineReason: orderData.declineReason
      },
      orderId: orderData.orderId
    };

    // Send via edge function
    const result = await callEmailEdgeFunction('order_declined', payload);

    console.log('✅ Order declined email sent:', result.emailId);
    return result;

  } catch (error) {
    return handleEmailError(error, 'sendOrderDeclined');
  }
}

/**
 * Send new order alert to admin team
 * @param {object} orderData - Order details
 * @param {string} orderData.orderId - Order UUID
 * @param {string} orderData.orderNumber - Order reference number
 * @param {string} orderData.customerName - Customer full name
 * @param {string} orderData.customerEmail - Customer email
 * @param {string} orderData.customerPhone - Customer phone
 * @param {string} orderData.boatName - Boat name
 * @param {string|number} orderData.boatLength - Boat length in feet
 * @param {string} orderData.marina - Marina name
 * @param {string} orderData.serviceType - Type of service
 * @param {string} orderData.serviceInterval - Service interval (1-mo, 2-mo, etc.)
 * @param {number} orderData.estimatedAmount - Estimated cost
 * @param {string} orderData.specialRequests - Special requests or notes
 * @param {number} orderData.pendingOrdersCount - Total pending orders
 * @returns {Promise<object>} Response with success, emailId, emailLogId
 */
export async function sendNewOrderAlert(orderData) {
  try {
    console.log('📧 Sending new order alert to operations team...');

    // Load template
    const template = await loadTemplate('new-order-alert');

    // Prepare template data
    const templateData = {
      orderNumber: escapeHtml(orderData.orderNumber),
      orderId: orderData.orderId,
      customerName: escapeHtml(orderData.customerName),
      customerEmail: escapeHtml(orderData.customerEmail),
      customerPhone: escapeHtml(orderData.customerPhone || 'Not provided'),
      boatName: escapeHtml(orderData.boatName),
      boatLength: orderData.boatLength,
      marinaName: escapeHtml(orderData.marina),
      serviceType: escapeHtml(orderData.serviceType),
      serviceInterval: escapeHtml(orderData.serviceInterval || 'one-time'),
      estimatedAmount: formatCurrency(orderData.estimatedAmount),
      specialRequests: escapeHtml(orderData.specialRequests || 'None'),
      pendingOrdersCount: orderData.pendingOrdersCount,
      currentYear: new Date().getFullYear()
    };

    // Render HTML
    const htmlContent = renderTemplate(template, templateData);

    // Build payload
    const payload = {
      recipientEmail: 'operations@sailorskills.com',
      recipientName: 'Operations Team',
      subject: `New Service Order - ${orderData.customerName} - ${orderData.boatName}`,
      htmlContent,
      metadata: {
        orderNumber: orderData.orderNumber,
        customerName: orderData.customerName,
        boatName: orderData.boatName,
        serviceType: orderData.serviceType,
        estimatedAmount: orderData.estimatedAmount,
        pendingOrdersCount: orderData.pendingOrdersCount
      },
      orderId: orderData.orderId
    };

    // Send via edge function
    const result = await callEmailEdgeFunction('new_order_alert', payload);

    console.log('✅ New order alert sent to operations team:', result.emailId);
    return result;

  } catch (error) {
    return handleEmailError(error, 'sendNewOrderAlert');
  }
}

/**
 * Get status color for badge
 * @param {string} status - Order status
 * @returns {string} Hex color code
 */
function getStatusColor(status) {
  const colors = {
    'pending': '#6b7280',
    'confirmed': '#3b82f6',
    'in_progress': '#f59e0b',
    'completed': '#16a34a',
    'cancelled': '#dc2626'
  };
  return colors[status] || '#6b7280';
}

/**
 * Get status details description
 * @param {string} status - Order status
 * @returns {string} Description text
 */
function getStatusDetails(status) {
  const details = {
    'pending': 'Your service request is under review. We will confirm your service date shortly.',
    'confirmed': 'Your service has been scheduled. We will arrive during your scheduled time window.',
    'in_progress': 'Our team is currently servicing your boat. You will receive a completion notification when finished.',
    'completed': 'Service completed successfully. Check your email for the service receipt and photos.',
    'cancelled': 'This service request has been cancelled. Contact us if you have questions.'
  };
  return details[status] || '';
}

/**
 * Get next steps for status
 * @param {string} status - Order status
 * @returns {string} Next steps text
 */
function getNextSteps(status) {
  const steps = {
    'pending': 'We will review your request and contact you within 24 hours to schedule your service.',
    'confirmed': 'Please ensure your boat is accessible at the marina during the scheduled time.',
    'in_progress': 'We will send you photos and a detailed service report when the work is complete.',
    'completed': 'Review your service photos in the customer portal. Payment receipt has been emailed.',
    'cancelled': 'Contact us at info@sailorskills.com if you would like to reschedule or discuss alternatives.'
  };
  return steps[status] || '';
}

/**
 * Send order status update email to customer
 * @param {object} orderData - Order details
 * @param {string} orderData.orderId - Order UUID
 * @param {string} orderData.customerEmail - Customer email address
 * @param {string} orderData.customerName - Customer full name
 * @param {string} orderData.boatName - Boat name
 * @param {string} orderData.oldStatus - Previous status
 * @param {string} orderData.newStatus - New status
 * @param {string} orderData.statusDetails - Custom status details (optional)
 * @param {string} orderData.nextSteps - Custom next steps (optional)
 * @returns {Promise<object>} Response with success, emailId, emailLogId
 */
export async function sendOrderStatusUpdate(orderData) {
  try {
    console.log('📧 Sending status update email...');

    // Load template
    const template = await loadTemplate('status-update');

    // Determine timeline visualization
    const statusOrder = ['pending', 'confirmed', 'in_progress', 'completed'];
    const currentIndex = statusOrder.indexOf(orderData.newStatus);

    // Prepare template data
    const templateData = {
      customerName: escapeHtml(orderData.customerName),
      boatName: escapeHtml(orderData.boatName),
      newStatus: orderData.newStatus.replace('_', ' ').toUpperCase(),
      statusColor: getStatusColor(orderData.newStatus),
      statusDetails: escapeHtml(orderData.statusDetails || getStatusDetails(orderData.newStatus)),
      nextSteps: escapeHtml(orderData.nextSteps || getNextSteps(orderData.newStatus)),

      // Timeline visualization
      confirmedColor: currentIndex >= 1 ? '#16a34a' : '#e5e7eb',
      confirmedIcon: currentIndex >= 1 ? '✓' : '',
      inProgressColor: currentIndex >= 2 ? '#16a34a' : currentIndex === 2 ? '#f59e0b' : '#e5e7eb',
      inProgressIcon: currentIndex >= 2 ? '✓' : currentIndex === 2 ? '●' : '',
      completedColor: currentIndex >= 3 ? '#16a34a' : '#e5e7eb',
      completedIcon: currentIndex >= 3 ? '✓' : '',

      currentYear: new Date().getFullYear()
    };

    // Render HTML
    const htmlContent = renderTemplate(template, templateData);

    // Build payload
    const payload = {
      recipientEmail: orderData.customerEmail,
      recipientName: orderData.customerName,
      subject: `Service Status: ${orderData.newStatus.replace('_', ' ').toUpperCase()} - ${orderData.boatName} - Sailor Skills`,
      htmlContent,
      metadata: {
        boatName: orderData.boatName,
        oldStatus: orderData.oldStatus,
        newStatus: orderData.newStatus
      },
      orderId: orderData.orderId
    };

    // Send via edge function
    const result = await callEmailEdgeFunction('status_update', payload);

    console.log('✅ Status update email sent:', result.emailId);
    return result;

  } catch (error) {
    return handleEmailError(error, 'sendOrderStatusUpdate');
  }
}
