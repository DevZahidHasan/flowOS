import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Result, ok, fail } from '@/lib/result/result';
import { InvoiceInsert, InvoiceUpdate, InvoiceWithItems, InvoiceLineItemInsert, InvoiceRow } from '../types';

export class InvoiceRepository {
  /**
   * Creates a new invoice and its line items in a transaction-like manner.
   * Supabase doesn't natively support RPC transactions easily without a custom function,
   * but we can insert the parent and then items.
   */
  static async createInvoice(
    invoice: InvoiceInsert,
    items: InvoiceLineItemInsert[]
  ): Promise<Result<InvoiceWithItems>> {
    const supabase = await createServerSupabaseClient();

    // 1. Insert the invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoice as never)
      .select()
      .single();

    if (invoiceError) {
      return fail({
        message: 'Failed to create invoice',
        code: 'DB_ERROR',
        status: 500,
      });
    }

    // 2. Attach the generated invoice_id to all items
    const itemsToInsert = items.map((item) => ({
      ...item,
      invoice_id: (invoiceData as unknown as { id: string }).id,
    }));

    // 3. Insert line items
    const { data: itemsData, error: itemsError } = await supabase
      .from('invoice_line_items')
      .insert(itemsToInsert as never)
      .select();

    if (itemsError) {
      // In a real robust system, we might compensate by deleting the invoice here
      // if we don't have a true transaction, or use a Postgres function.
      return fail({
        message: 'Failed to create invoice line items',
        code: 'DB_ERROR',
        status: 500,
      });
    }

    return ok({
      ...(invoiceData as unknown as InvoiceRow),
      items: itemsData as any[],
    } as InvoiceWithItems);
  }

  static async getInvoiceById(
    workspaceId: string,
    invoiceId: string
  ): Promise<Result<InvoiceWithItems>> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_line_items(*)
      `)
      .eq('workspace_id', workspaceId)
      .eq('id', invoiceId)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      return fail({
        message: 'Invoice not found',
        code: 'NOT_FOUND',
        status: 404,
      });
    }

    // Supabase returns related tables as arrays or objects depending on the relationship.
    // invoice_line_items is an array.
    return ok(data as unknown as InvoiceWithItems);
  }

  static async updateInvoice(
    workspaceId: string,
    invoiceId: string,
    updates: InvoiceUpdate
  ): Promise<Result<InvoiceRow>> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('invoices')
      .update(updates as never)
      .eq('workspace_id', workspaceId)
      .eq('id', invoiceId)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      return fail({
        message: 'Failed to update invoice',
        code: 'DB_ERROR',
        status: 500,
      });
    }

    return ok(data as unknown as InvoiceRow);
  }

  static async deleteInvoice(
    workspaceId: string,
    invoiceId: string
  ): Promise<Result<null>> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('invoices')
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq('workspace_id', workspaceId)
      .eq('id', invoiceId);

    if (error) {
      return fail({
        message: 'Failed to delete invoice',
        code: 'DB_ERROR',
        status: 500,
      });
    }

    return ok(null);
  }

  /**
   * Used strictly for generating sequential/unique invoice numbers internally.
   * Gets the count of existing invoices in a workspace to calculate the next sequence number.
   */
  static async countInvoicesByWorkspace(workspaceId: string): Promise<Result<number>> {
    const supabase = await createServerSupabaseClient();

    const { count, error } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId);
      
    // Notice we DO NOT filter by `is('deleted_at', null)` because even if an invoice is deleted,
    // its number was already consumed. Sequence should always go up.

    if (error) {
      return fail({
        message: 'Failed to count invoices',
        code: 'DB_ERROR',
        status: 500,
      });
    }

    return ok(count || 0);
  }

  static async getInvoices(options: {
    workspaceId: string;
    page: number;
    limit: number;
    search?: string;
    status?: string;
    customerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Result<{ data: InvoiceRow[]; count: number }>> {
    const supabase = await createServerSupabaseClient();
    const { workspaceId, page, limit, search, status, customerId, sortBy, sortOrder } = options;
    
    // We want to fetch invoices and the associated customer name/email.
    let query = supabase
      .from('invoices')
      .select('*, customer:customers(full_name, email)', { count: 'exact' })
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null);

    if (status) {
      query = query.eq('status', status);
    }
    
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,notes.ilike.%${search}%`);
      // Note: searching by customer name requires an inner join or a view in PostgREST,
      // but doing an ilike on parent table and a related table via PostgREST is supported 
      // if we use a specific syntax, e.g., `customers!inner(full_name.ilike.%${search}%)`.
      // For simplicity, we just search invoice fields here.
    }

    const sortColumn = sortBy || 'created_at';
    const isAscending = sortOrder === 'asc';
    
    query = query.order(sortColumn, { ascending: isAscending });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return fail({
        message: 'Failed to fetch invoices',
        code: 'DB_ERROR',
        status: 500,
      });
    }

    return ok({
      data: data as unknown as InvoiceRow[],
      count: count || 0,
    });
  }
}
