'use server';

import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { getWorkspaceActionSession } from '@/features/auth/utils/action-session';
import { InvoiceService } from '../services/invoice.service';
import { CreateInvoiceSchema, CreateInvoiceInput, UpdateInvoiceSchema, UpdateInvoiceInput } from '../validations/invoice.schema';
import { InvoiceRow, InvoiceWithItems } from '../types';

export async function createInvoiceAction(input: CreateInvoiceInput): Promise<Result<InvoiceWithItems>> {
  try {
    const sessionRes = await getWorkspaceActionSession(input.workspace_id);
    if (sessionRes.error) return fail(sessionRes.error);
    const { userId } = sessionRes.data;

    // Validate Input
    const parsed = CreateInvoiceSchema.safeParse(input);
    if (!parsed.success) {
      return fail(AppErrorFactory.badRequest('Invalid invoice data', 'VALIDATION_ERROR'));
    }

    // Delegate to Service
    return await InvoiceService.createInvoice(parsed.data, userId);
  } catch (error) {
    return fail(AppErrorFactory.fromUnknown(error));
  }
}

export async function updateInvoiceAction(workspaceId: string, invoiceId: string, input: UpdateInvoiceInput): Promise<Result<InvoiceRow>> {
  try {
    const sessionRes = await getWorkspaceActionSession(workspaceId);
    if (sessionRes.error) return fail(sessionRes.error);
    const { userId } = sessionRes.data;

    // Ensure IDs are injected correctly for validation
    const payload = { ...input, id: invoiceId, workspace_id: workspaceId };

    // Validate Input
    const parsed = UpdateInvoiceSchema.safeParse(payload);
    if (!parsed.success) {
      return fail(AppErrorFactory.badRequest('Invalid invoice update data', 'VALIDATION_ERROR'));
    }

    // Delegate to Service
    return await InvoiceService.updateInvoice(workspaceId, invoiceId, parsed.data, userId);
  } catch (error) {
    return fail(AppErrorFactory.fromUnknown(error));
  }
}

export async function deleteInvoiceAction(workspaceId: string, invoiceId: string): Promise<Result<null>> {
  try {
    const sessionRes = await getWorkspaceActionSession(workspaceId);
    if (sessionRes.error) return fail(sessionRes.error);

    // Delegate to Service
    return await InvoiceService.deleteInvoice(workspaceId, invoiceId);
  } catch (error) {
    return fail(AppErrorFactory.fromUnknown(error));
  }
}

export async function getInvoicesAction(options: {
  workspaceId: string;
  page: number;
  limit: number;
  search?: string;
  status?: string;
  customerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<Result<{ data: InvoiceRow[]; count: number }>> {
  try {
    const sessionRes = await getWorkspaceActionSession(options.workspaceId);
    if (sessionRes.error) return fail(sessionRes.error);

    return await InvoiceService.getInvoices(options);
  } catch (error) {
    return fail(AppErrorFactory.fromUnknown(error));
  }
}

export async function updateInvoiceStatusAction(
  workspaceId: string, 
  invoiceId: string, 
  status: 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'
): Promise<Result<InvoiceRow>> {
  return updateInvoiceAction(workspaceId, invoiceId, { id: invoiceId, status });
}

export async function bulkDeleteInvoicesAction(workspaceId: string, invoiceIds: string[]): Promise<Result<null>> {
  try {
    // Basic bulk implementation. For enterprise, this should be done in a single query or Promise.allSettled
    for (const id of invoiceIds) {
      const res = await deleteInvoiceAction(workspaceId, id);
      if (res.error) return res; // Fail fast on first error
    }
    return ok(null);
  } catch (error) {
    return fail(AppErrorFactory.fromUnknown(error));
  }
}

export async function bulkUpdateInvoiceStatusAction(
  workspaceId: string, 
  invoiceIds: string[], 
  status: 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'
): Promise<Result<null>> {
  try {
    for (const id of invoiceIds) {
      const res = await updateInvoiceStatusAction(workspaceId, id, status);
      if (res.error) return fail(res.error);
    }
    return ok(null);
  } catch (error) {
    return fail(AppErrorFactory.fromUnknown(error));
  }
}
