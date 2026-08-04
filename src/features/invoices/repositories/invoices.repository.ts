import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { Invoice, CreateInvoiceInput, UpdateInvoiceStatusInput } from '../types';
import type { Database } from '@/types/database';

export class InvoicesRepository {
  async getWorkspaceInvoices(workspaceId: string): Promise<Result<Invoice[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      
      // We fetch invoices and join with customers to get the customer name
      const { data: rawData, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!inner ( full_name )
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'INVOICES_FETCH_FAILED'));
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = rawData as any[];

      const invoices: Invoice[] = rows.map((r) => ({
        id: r.id,
        workspaceId: r.workspace_id,
        customerId: r.customer_id,
        appointmentId: r.appointment_id,
        invoiceNumber: r.invoice_number,
        status: r.status as Invoice['status'],
        subtotal: Number(r.subtotal),
        taxAmount: Number(r.tax_amount),
        totalAmount: Number(r.total_amount),
        issueDate: r.issue_date,
        dueDate: r.due_date,
        notes: r.notes,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        customerName: r.customers?.full_name,
      }));

      return ok(invoices);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async createInvoice(input: CreateInvoiceInput): Promise<Result<Invoice>> {
    try {
      const supabase = await createServerSupabaseClient();
      
      // 1. Calculate totals
      const subtotal = input.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
      const totalAmount = subtotal + (input.taxAmount || 0);
      
      // Generate a random invoice number (e.g. INV-12345)
      const invNumber = `INV-${Math.floor(10000 + Math.random() * 90000)}`;

      const insertPayload: Database['public']['Tables']['invoices']['Insert'] = {
        workspace_id: input.workspaceId,
        customer_id: input.customerId,
        appointment_id: input.appointmentId || null,
        invoice_number: invNumber,
        status: 'UNPAID',
        subtotal: subtotal,
        tax_amount: input.taxAmount || 0,
        total_amount: totalAmount,
        due_date: new Date(input.dueDate).toISOString(),
        notes: input.notes || null,
      };

      // 2. Insert Invoice
      const { data: rawInvoice, error: invError } = await supabase
        .from('invoices')
        .insert(insertPayload as never)
        .select()
        .single();

      if (invError || !rawInvoice) {
        return fail(AppErrorFactory.badRequest(invError?.message || 'Failed to create invoice', 'INVOICE_CREATE_FAILED'));
      }
      
      const invId = (rawInvoice as any).id;

      // 3. Insert Invoice Items
      const itemsPayload: Database['public']['Tables']['invoice_items']['Insert'][] = input.items.map(item => ({
        invoice_id: invId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.quantity * item.unitPrice,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsPayload as never);

      if (itemsError) {
        return fail(AppErrorFactory.internal(itemsError.message, 'INVOICE_ITEMS_CREATE_FAILED'));
      }

      // Return the created invoice
      return this.getInvoiceById(invId, input.workspaceId);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getInvoiceById(invoiceId: string, workspaceId: string): Promise<Result<Invoice>> {
    try {
      const supabase = await createServerSupabaseClient();
      
      const { data: rawData, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!inner ( full_name ),
          invoice_items (*)
        `)
        .eq('id', invoiceId)
        .eq('workspace_id', workspaceId)
        .single();

      if (error || !rawData) {
        return fail(AppErrorFactory.notFound('Invoice not found'));
      }

      const r: any = rawData;

      const invoice: Invoice = {
        id: r.id,
        workspaceId: r.workspace_id,
        customerId: r.customer_id,
        appointmentId: r.appointment_id,
        invoiceNumber: r.invoice_number,
        status: r.status as Invoice['status'],
        subtotal: Number(r.subtotal),
        taxAmount: Number(r.tax_amount),
        totalAmount: Number(r.total_amount),
        issueDate: r.issue_date,
        dueDate: r.due_date,
        notes: r.notes,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        customerName: r.customers?.full_name,
        items: (r.invoice_items || []).map((i: any) => ({
          id: i.id,
          invoiceId: i.invoice_id,
          description: i.description,
          quantity: i.quantity,
          unitPrice: Number(i.unit_price),
          totalPrice: Number(i.total_price),
        }))
      };

      return ok(invoice);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async updateInvoiceStatus(input: UpdateInvoiceStatusInput): Promise<Result<boolean>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase
        .from('invoices')
        .update({ status: input.status, updated_at: new Date().toISOString() } as never)
        .eq('id', input.invoiceId)
        .eq('workspace_id', input.workspaceId);

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'INVOICE_STATUS_UPDATE_FAILED'));
      }

      return ok(true);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }
}
