'use server';

import { InvoicesService } from '../services/invoices.service';
import { createInvoiceSchema, updateInvoiceStatusSchema, Invoice } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const invoicesService = new InvoicesService();

export async function getInvoicesAction(workspaceId: string): Promise<Result<Invoice[]>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return invoicesService.getWorkspaceInvoices(workspaceId);
}

export async function createInvoiceAction(formData: unknown): Promise<Result<Invoice>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  const parsed = createInvoiceSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid invoice details'));
  }

  return invoicesService.createInvoice(parsed.data);
}

export async function updateInvoiceStatusAction(formData: unknown): Promise<Result<boolean>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  const parsed = updateInvoiceStatusSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid status payload'));
  }

  return invoicesService.updateInvoiceStatus(parsed.data);
}
