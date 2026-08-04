'use server';

import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { getWorkspaceActionSession } from '@/features/auth/utils/action-session';
import { PaymentService } from '../services/payment.service';
import { RecordPaymentSchema, RecordPaymentInput, PaymentRow, InvoicePaymentSummary } from '../types';

/**
 * Record a real-world payment against an invoice.
 * Validates workspace session, validates input schema, delegates to service.
 */
export async function recordPaymentAction(
  input: RecordPaymentInput
): Promise<Result<PaymentRow>> {
  try {
    const sessionRes = await getWorkspaceActionSession(input.workspace_id);
    if (sessionRes.error) return fail(sessionRes.error);
    const { userId } = sessionRes.data;

    const parsed = RecordPaymentSchema.safeParse(input);
    if (!parsed.success) {
      return fail(AppErrorFactory.badRequest(
        parsed.error.errors[0]?.message ?? 'Invalid payment data',
        'PAYMENT_VALIDATION_ERROR'
      ));
    }

    return await PaymentService.recordPayment(parsed.data, userId);
  } catch (err) {
    return fail(AppErrorFactory.fromUnknown(err));
  }
}

/**
 * Soft-delete a payment and recalculate invoice status.
 */
export async function deletePaymentAction(
  workspaceId: string,
  paymentId: string
): Promise<Result<null>> {
  try {
    const sessionRes = await getWorkspaceActionSession(workspaceId);
    if (sessionRes.error) return fail(sessionRes.error);
    const { userId } = sessionRes.data;

    return await PaymentService.deletePayment(workspaceId, paymentId, userId);
  } catch (err) {
    return fail(AppErrorFactory.fromUnknown(err));
  }
}

/**
 * Fetch all payments and computed financial summary for an invoice.
 */
export async function getInvoicePaymentsAction(
  workspaceId: string,
  invoiceId: string
): Promise<Result<InvoicePaymentSummary>> {
  try {
    const sessionRes = await getWorkspaceActionSession(workspaceId);
    if (sessionRes.error) return fail(sessionRes.error);

    return await PaymentService.getInvoicePayments(workspaceId, invoiceId);
  } catch (err) {
    return fail(AppErrorFactory.fromUnknown(err));
  }
}
