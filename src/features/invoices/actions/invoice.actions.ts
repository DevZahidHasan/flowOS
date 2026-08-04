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
    const { user } = sessionRes.data;

    // Validate Input
    const parsed = CreateInvoiceSchema.safeParse(input);
    if (!parsed.success) {
      return fail(AppErrorFactory.badRequest('Invalid invoice data', 'VALIDATION_ERROR'));
    }

    // Delegate to Service
    return await InvoiceService.createInvoice(parsed.data, user.id);
  } catch (error) {
    return fail(AppErrorFactory.fromUnknown(error));
  }
}

export async function updateInvoiceAction(workspaceId: string, invoiceId: string, input: UpdateInvoiceInput): Promise<Result<InvoiceRow>> {
  try {
    const sessionRes = await getWorkspaceActionSession(workspaceId);
    if (sessionRes.error) return fail(sessionRes.error);
    const { user } = sessionRes.data;

    // Ensure IDs are injected correctly for validation
    const payload = { ...input, id: invoiceId, workspace_id: workspaceId };

    // Validate Input
    const parsed = UpdateInvoiceSchema.safeParse(payload);
    if (!parsed.success) {
      return fail(AppErrorFactory.badRequest('Invalid invoice update data', 'VALIDATION_ERROR'));
    }

    // Delegate to Service
    return await InvoiceService.updateInvoice(workspaceId, invoiceId, parsed.data, user.id);
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
