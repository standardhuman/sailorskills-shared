import { formatInvoiceStatus } from '../../utils/invoice-formatters.js';

/**
 * Creates a status badge element
 * @param {string} status - The status value (paid, pending, overdue, etc.)
 * @returns {HTMLElement} - The badge element
 */
export function createStatusBadge(status) {
  const badge = document.createElement('span');
  const formatted = formatInvoiceStatus(status);

  badge.className = `status-badge ${formatted.class}`;
  badge.textContent = formatted.text;

  return badge;
}

/**
 * Updates an existing badge with new status
 * @param {HTMLElement} badge - The badge element to update
 * @param {string} status - The new status value
 */
export function updateStatusBadge(badge, status) {
  const formatted = formatInvoiceStatus(status);
  badge.className = `status-badge ${formatted.class}`;
  badge.textContent = formatted.text;
}
