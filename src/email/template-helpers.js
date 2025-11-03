/**
 * Email Template Helpers
 * Utilities for rendering email templates
 */

/**
 * Format date for email display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date (e.g., "Monday, November 3, 2025")
 */
export function formatEmailDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format currency for email display
 * @param {number} amount - Amount in dollars
 * @returns {string} Formatted amount (e.g., "$250.00")
 */
export function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} HTML-safe text
 */
export function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Render template with variables
 * @param {string} template - HTML template with {{variables}}
 * @param {object} data - Data to replace variables
 * @returns {string} Rendered HTML
 */
export function renderTemplate(template, data) {
  let result = template;

  // Replace all {{variable}} with data
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }

  // Remove any remaining unreplaced variables
  result = result.replace(/{{[^}]+}}/g, '');

  return result;
}
