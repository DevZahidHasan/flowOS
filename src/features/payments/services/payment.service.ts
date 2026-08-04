import { PaymentRepository } from '../repositories/payment.repository';
import { InvoiceRepository } from '@/features/invoices/repositories/invoice.repository';
import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { RecordPaymentInput, PaymentRow, InvoicePaymentSummary } from '../types';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * PaymentService — owns ALL business logic for payment recording.
 *
 * Business Rules enforced here:
 * 1. Payment amount must be > 0                    (schema-level + runtime)
 * 2. Cannot record payment > outstanding balance
 * 3. Invoice must exist and belong to workspace
 * 4. Invoice must not be CANCELLED or REFUNDED
 * 5. After recording: auto-updates invoice status
 *    - First payment on a SENT/OVERDUE invoice → keep status, re-compute
 *    - outstanding > 0 → PARTIALLY_PAID
 *    - outstanding === 0 → PAID
 * 6. After deleting a payment: recalculate + revert status if needed
 *    - PAID → SENT (if not fully paid anymore)
 *    - PARTIALLY_PAID → SENT (if no payments left)
 *
 * Future-proof:
 * - No payment gateway coupling. This class knows nothing about Stripe/PayPal.
 * - A future PaymentGatewayService can call this service after processing externally.
 */

const repo = new PaymentRepository();

function roundToTwo(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export class PaymentService {
  /**
   * Record a real-world payment (cash, card, transfer, etc.)
   * and automatically sync invoice status.
   */
  static async recordPayment(
    input: RecordPaymentInput,
    userId: string
  ): Promise<Result<PaymentRow>> {
    try {
      // 1. Verify invoice exists and belongs to workspace
      const invoiceRes = await InvoiceRepository.getInvoiceById(
        input.workspace_id,
        input.invoice_id
      );
      if (invoiceRes.error) return fail(invoiceRes.error);

      const invoice = invoiceRes.data;

      // 2. Guard against terminal statuses
      if (invoice.status === 'CANCELLED' || invoice.status === 'REFUNDED') {
        return fail(AppErrorFactory.badRequest(
          `Cannot record a payment on a ${invoice.status.toLowerCase()} invoice.`,
          'PAYMENT_TERMINAL_STATUS'
        ));
      }

      // 3. Calculate current outstanding balance
      const sumRes = await repo.sumInvoicePayments(input.workspace_id, input.invoice_id);
      if (sumRes.error) return fail(sumRes.error);

      const alreadyPaid   = roundToTwo(sumRes.data);
      const invoiceTotal  = roundToTwo(Number(invoice.total_amount));
      const outstanding   = roundToTwo(invoiceTotal - alreadyPaid);
      const paymentAmount = roundToTwo(input.amount);

      // 4. Reject zero amounts (belt-and-suspenders over schema validation)
      if (paymentAmount <= 0) {
        return fail(AppErrorFactory.badRequest(
          'Payment amount must be greater than zero.',
          'PAYMENT_ZERO_AMOUNT'
        ));
      }

      // 5. Reject overpayments
      if (paymentAmount > outstanding + 0.001) {
        // +0.001 tolerance for floating point
        return fail(AppErrorFactory.badRequest(
          `Payment of ${paymentAmount} exceeds the outstanding balance of ${outstanding}. Maximum allowed: ${outstanding}.`,
          'PAYMENT_EXCEEDS_BALANCE'
        ));
      }

      // 6. Persist the payment
      const paymentRes = await repo.createPayment({
        workspace_id:    input.workspace_id,
        invoice_id:      input.invoice_id,
        amount:          paymentAmount,
        payment_method:  input.payment_method,
        reference_number: input.reference_number ?? null,
        notes:           input.notes ?? null,
        payment_date:    input.payment_date,
        received_by:     input.received_by ?? null,
      });

      if (paymentRes.error) return fail(paymentRes.error);

      // 7. Recalculate status from payments
      const newAlreadyPaid = roundToTwo(alreadyPaid + paymentAmount);
      const newOutstanding = roundToTwo(invoiceTotal - newAlreadyPaid);

      await PaymentService.syncInvoiceStatus(
        input.workspace_id,
        input.invoice_id,
        newOutstanding,
        userId
      );

      return ok(paymentRes.data);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  /**
   * Delete a recorded payment and revert invoice status if needed.
   */
  static async deletePayment(
    workspaceId: string,
    paymentId: string,
    userId: string
  ): Promise<Result<null>> {
    try {
      // 1. Fetch payment to get invoice_id before deleting
      const paymentRes = await repo.getPaymentById(workspaceId, paymentId);
      if (paymentRes.error) return fail(paymentRes.error);

      const invoiceId = paymentRes.data.invoice_id;
      const deletedAmount = roundToTwo(Number(paymentRes.data.amount));

      // 2. Soft-delete
      const deleteRes = await repo.deletePayment(workspaceId, paymentId);
      if (deleteRes.error) return fail(deleteRes.error);

      // 3. Re-sum remaining payments after deletion
      const sumRes = await repo.sumInvoicePayments(workspaceId, invoiceId);
      if (sumRes.error) return fail(sumRes.error);

      // Fetch invoice to get total
      const invoiceRes = await InvoiceRepository.getInvoiceById(workspaceId, invoiceId);
      if (invoiceRes.error) return fail(invoiceRes.error);

      const invoiceTotal = roundToTwo(Number(invoiceRes.data.total_amount));
      const remainingPaid = roundToTwo(sumRes.data);
      const newOutstanding = roundToTwo(invoiceTotal - remainingPaid);

      // 4. Sync invoice status
      await PaymentService.syncInvoiceStatus(
        workspaceId,
        invoiceId,
        newOutstanding,
        userId
      );

      void deletedAmount; // referenced above; silence lint
      return ok(null);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  /**
   * Get all payments and computed summary for an invoice.
   */
  static async getInvoicePayments(
    workspaceId: string,
    invoiceId: string
  ): Promise<Result<InvoicePaymentSummary>> {
    try {
      const invoiceRes = await InvoiceRepository.getInvoiceById(workspaceId, invoiceId);
      if (invoiceRes.error) return fail(invoiceRes.error);

      const paymentsRes = await repo.getInvoicePayments(workspaceId, invoiceId);
      if (paymentsRes.error) return fail(paymentsRes.error);

      const invoiceTotal = roundToTwo(Number(invoiceRes.data.total_amount));
      const totalPaid = roundToTwo(
        paymentsRes.data.reduce((sum, p) => sum + Number(p.amount), 0)
      );
      const outstanding = roundToTwo(invoiceTotal - totalPaid);

      return ok({
        invoiceTotal,
        totalPaid,
        outstanding,
        payments: paymentsRes.data,
      });
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  /**
   * Internal: Sync invoice status based on outstanding balance.
   * Payments are the single source of truth for status.
   *
   * Status rules:
   * - outstanding === 0 → PAID
   * - outstanding > 0 and there are payments → PARTIALLY_PAID
   * - outstanding === invoiceTotal (no payments) → revert to SENT
   */
  private static async syncInvoiceStatus(
    workspaceId: string,
    invoiceId: string,
    outstanding: number,
    userId: string
  ): Promise<void> {
    let newStatus: 'SENT' | 'PARTIALLY_PAID' | 'PAID';

    if (outstanding <= 0) {
      newStatus = 'PAID';
    } else {
      // Check if any payments exist (partial case vs. no payments)
      const sumRes = await repo.sumInvoicePayments(workspaceId, invoiceId);
      const totalPaid = sumRes.data ?? 0;
      newStatus = totalPaid > 0 ? 'PARTIALLY_PAID' : 'SENT';
    }

    // Use Supabase directly — update only status and audit fields.
    // We do NOT call InvoiceService.updateInvoice because that does
    // status-transition validation which conflicts with payment-driven updates.
    try {
      const supabase = await createServerSupabaseClient();
      await supabase
        .from('invoices')
        .update({
          status:     newStatus,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', invoiceId)
        .eq('workspace_id', workspaceId);
    } catch {
      // Non-critical failure — payment was recorded; status sync can be retried
    }
  }
}
