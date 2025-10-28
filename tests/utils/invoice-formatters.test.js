import { describe, it, expect } from 'vitest';
import { formatCurrency, formatInvoiceStatus, formatPaymentMethod, formatInvoiceDate } from '../../src/utils/invoice-formatters.js';

describe('Invoice Formatters', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('formats invoice status with correct badge class', () => {
    expect(formatInvoiceStatus('paid')).toEqual({ text: 'Paid', class: 'status-paid' });
    expect(formatInvoiceStatus('pending')).toEqual({ text: 'Pending', class: 'status-pending' });
    expect(formatInvoiceStatus('overdue')).toEqual({ text: 'Overdue', class: 'status-overdue' });
    expect(formatInvoiceStatus('cancelled')).toEqual({ text: 'Cancelled', class: 'status-cancelled' });
  });

  it('formats payment method with icon', () => {
    expect(formatPaymentMethod('stripe')).toEqual({ text: 'Credit Card', icon: '💳' });
    expect(formatPaymentMethod('venmo')).toEqual({ text: 'Venmo', icon: '📱' });
    expect(formatPaymentMethod('cash')).toEqual({ text: 'Cash', icon: '💵' });
    expect(formatPaymentMethod(null)).toEqual({ text: 'Not Specified', icon: '' });
  });

  it('formats invoice dates', () => {
    const date = new Date('2025-10-27T10:00:00Z');
    expect(formatInvoiceDate(date)).toBe('Oct 27, 2025');
    expect(formatInvoiceDate(null)).toBe('N/A');
  });
});
