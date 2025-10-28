/**
 * Supabase query builders for invoice data
 */

export function buildTransactionListQuery(supabase, filters = {}) {
  let query = supabase
    .from('transaction_details')
    .select('*')
    .order('issued_at', { ascending: false });

  if (filters.status) {
    query = query.eq('invoice_status', filters.status);
  }

  if (filters.customer_id) {
    query = query.eq('customer_id', filters.customer_id);
  }

  if (filters.boat_id) {
    query = query.eq('boat_id', filters.boat_id);
  }

  if (filters.date_from) {
    query = query.gte('issued_at', filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte('issued_at', filters.date_to);
  }

  if (filters.payment_method) {
    query = query.eq('payment_method', filters.payment_method);
  }

  if (filters.customer_search) {
    // Search in customer name and email using ilike (case-insensitive)
    query = query.or(`customer_details->>name.ilike.%${filters.customer_search}%,customer_details->>email.ilike.%${filters.customer_search}%`);
  }

  if (filters.has_service_link !== undefined) {
    if (filters.has_service_link) {
      query = query.not('service_log_id', 'is', null);
    } else {
      query = query.is('service_log_id', null);
    }
  }

  return query;
}

export async function getInvoiceWithLineItems(supabase, invoiceId) {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (invoiceError) throw invoiceError;

  const { data: lineItems, error: lineItemsError } = await supabase
    .from('invoice_line_items')
    .select('*')
    .eq('invoice_id', invoiceId);

  if (lineItemsError) throw lineItemsError;

  return { ...invoice, line_items: lineItems };
}

export async function linkInvoiceToService(supabase, invoiceId, serviceLogId) {
  // Update invoice
  const { error: invoiceError } = await supabase
    .from('invoices')
    .update({ service_id: serviceLogId })
    .eq('id', invoiceId);

  if (invoiceError) throw invoiceError;

  // Update service_log
  const { error: serviceError } = await supabase
    .from('service_logs')
    .update({ invoice_id: invoiceId })
    .eq('id', serviceLogId);

  if (serviceError) throw serviceError;

  return true;
}
