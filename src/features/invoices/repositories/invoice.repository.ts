import { createClient } from '@/lib/supabase/server';
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
    const supabase = await createClient();

    // 1. Insert the invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoice)
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
      invoice_id: invoiceData.id,
    }));

    // 3. Insert line items
    const { data: itemsData, error: itemsError } = await supabase
      .from('invoice_line_items')
      .insert(itemsToInsert)
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
      ...invoiceData,
      items: itemsData,
    });
  }

  static async getInvoiceById(
    workspaceId: string,
    invoiceId: string
  ): Promise<Result<InvoiceWithItems>> {
    const supabase = await createClient();

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
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
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

    return ok(data);
  }

  static async deleteInvoice(
    workspaceId: string,
    invoiceId: string
  ): Promise<Result<null>> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('invoices')
      .update({ deleted_at: new Date().toISOString() })
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
    const supabase = await createClient();

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
}
