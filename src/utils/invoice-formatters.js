/**
 * Invoice formatting utilities
 */

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatInvoiceStatus(status) {
  const statusMap = {
    paid: { text: 'Paid', class: 'status-paid' },
    pending: { text: 'Pending', class: 'status-pending' },
    overdue: { text: 'Overdue', class: 'status-overdue' },
    cancelled: { text: 'Cancelled', class: 'status-cancelled' }
  };
  return statusMap[status] || { text: status, class: 'status-unknown' };
}

export function formatPaymentMethod(method) {
  const methodMap = {
    stripe: { text: 'Credit Card', icon: '💳' },
    venmo: { text: 'Venmo', icon: '📱' },
    zelle: { text: 'Zelle', icon: '💰' },
    cash: { text: 'Cash', icon: '💵' },
    check: { text: 'Check', icon: '📝' }
  };
  return methodMap[method] || { text: 'Not Specified', icon: '' };
}

export function formatInvoiceDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
