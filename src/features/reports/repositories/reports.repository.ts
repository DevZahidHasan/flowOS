import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';

export interface RawInvoiceRow {
  id: string;
  workspace_id: string;
  customer_id: string;
  invoice_number: string;
  status: string;
  currency: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  issue_date: string;
  due_date: string;
  notes: string | null;
  created_at: string;
  customers: {
    full_name: string;
  } | null;
}

export interface RawPaymentRow {
  id: string;
  workspace_id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  payment_date: string;
  created_at: string;
  invoices: {
    invoice_number: string;
    total_amount: number;
    tax_amount: number;
    customer_id: string;
    customers: {
      full_name: string;
    } | null;
  } | null;
}

export class ReportsRepository {
  async getInvoices(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Result<RawInvoiceRow[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      let query = supabase
        .from('invoices')
        .select(`
          id,
          workspace_id,
          customer_id,
          invoice_number,
          status,
          currency,
          subtotal,
          discount_amount,
          tax_amount,
          total_amount,
          issue_date,
          due_date,
          notes,
          created_at,
          customers (
            full_name
          )
        `)
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null);

      if (startDate) {
        query = query.gte('issue_date', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('issue_date', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'REPORTS_INVOICES_FETCH_FAILED'));
      }

      const rows = (data || []) as unknown as RawInvoiceRow[];
      return ok(rows);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getPayments(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Result<RawPaymentRow[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      let query = supabase
        .from('payments')
        .select(`
          id,
          workspace_id,
          invoice_id,
          amount,
          payment_method,
          reference_number,
          notes,
          payment_date,
          created_at,
          invoices (
            invoice_number,
            total_amount,
            tax_amount,
            customer_id,
            customers (
              full_name
            )
          )
        `)
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null);

      if (startDate) {
        query = query.gte('payment_date', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('payment_date', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'REPORTS_PAYMENTS_FETCH_FAILED'));
      }

      const rows = (data || []) as unknown as RawPaymentRow[];
      return ok(rows);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getMonthlyRevenue(
    workspaceId: string
  ): Promise<Result<{ payment_date: string; amount: number }[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('payments')
        .select('payment_date, amount')
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null)
        .order('payment_date', { ascending: true });

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'REPORTS_MONTHLY_REVENUE_FAILED'));
      }

      const raw = (data || []) as unknown as { payment_date: string; amount: number }[];
      const rows = raw.map(r => ({
        payment_date: r.payment_date,
        amount: Number(r.amount)
      }));

      return ok(rows);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getInvoiceStatusSummary(
    workspaceId: string
  ): Promise<Result<{ status: string; total_amount: number }[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('invoices')
        .select('status, total_amount')
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null);

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'REPORTS_INVOICE_STATUS_SUMMARY_FAILED'));
      }

      const raw = (data || []) as unknown as { status: string; total_amount: number }[];
      const rows = raw.map(r => ({
        status: r.status,
        total_amount: Number(r.total_amount)
      }));

      return ok(rows);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getPaymentMethodSummary(
    workspaceId: string
  ): Promise<Result<{ payment_method: string; amount: number }[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('payments')
        .select('payment_method, amount')
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null);

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'REPORTS_PAYMENT_METHOD_SUMMARY_FAILED'));
      }

      const raw = (data || []) as unknown as { payment_method: string; amount: number }[];
      const rows = raw.map(r => ({
        payment_method: r.payment_method,
        amount: Number(r.amount)
      }));

      return ok(rows);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }
}
