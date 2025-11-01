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

// Export functions (implementations in next tasks)
export async function sendOrderConfirmation(orderData) {
  // TODO: Implement in Task 3
  throw new Error('Not implemented yet');
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
