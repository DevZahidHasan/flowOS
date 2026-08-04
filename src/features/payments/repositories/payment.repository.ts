import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { PaymentRow, PaymentInsert } from '../types';

/**
 * PaymentRepository — pure data access only.
 * Zero business logic. No status calculations. No amount validation.
 * The Service layer owns all business rules.
 */
export class PaymentRepository {
  /**
   * Persist a new payment record.
   */
  async createPayment(input: PaymentInsert): Promise<Result<PaymentRow>> {
    try {
      const supabase = await createServerSupabaseClient();

      const { data, error } = await supabase
        .from('payments')
        .insert(input as never)
        .select()
        .single();

      if (error || !data) {
        return fail(AppErrorFactory.internal(
          error?.message ?? 'Failed to record payment',
          'PAYMENT_CREATE_FAILED'
        ));
      }

      return ok(data as unknown as PaymentRow);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  /**
   * Fetch all active payments for a given invoice.
   * Ordered newest-first by payment_date.
   */
  async getInvoicePayments(workspaceId: string, invoiceId: string): Promise<Result<PaymentRow[]>> {
    try {
      const supabase = await createServerSupabaseClient();

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('invoice_id', invoiceId)
        .is('deleted_at', null)
        .order('payment_date', { ascending: false });

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'PAYMENTS_FETCH_FAILED'));
      }

      return ok((data ?? []) as unknown as PaymentRow[]);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  /**
   * Fetch a single payment by ID, scoped to workspace for security.
   */
  async getPaymentById(workspaceId: string, paymentId: string): Promise<Result<PaymentRow>> {
    try {
      const supabase = await createServerSupabaseClient();

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null)
        .single();

      if (error || !data) {
        return fail(AppErrorFactory.notFound('Payment not found', 'PAYMENT_NOT_FOUND'));
      }

      return ok(data as unknown as PaymentRow);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  /**
   * Soft-delete a payment by setting deleted_at.
   */
  async deletePayment(workspaceId: string, paymentId: string): Promise<Result<null>> {
    try {
      const supabase = await createServerSupabaseClient();

      const { error } = await supabase
        .from('payments')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('id', paymentId)
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null);

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'PAYMENT_DELETE_FAILED'));
      }

      return ok(null);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  /**
   * Sum all active payments for a given invoice.
   * Used by the service layer for balance validation.
   */
  async sumInvoicePayments(workspaceId: string, invoiceId: string): Promise<Result<number>> {
    try {
      const supabase = await createServerSupabaseClient();

      const { data, error } = await supabase
        .from('payments')
        .select('amount')
        .eq('workspace_id', workspaceId)
        .eq('invoice_id', invoiceId)
        .is('deleted_at', null);

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'PAYMENT_SUM_FAILED'));
      }

      const total = (data ?? []).reduce(
        (sum, row) => sum + Number((row as unknown as PaymentRow).amount),
        0
      );

      return ok(total);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }
}
