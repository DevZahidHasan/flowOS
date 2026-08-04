'use server';

import { CrmService } from '../services/crm.service';
import { addCustomerNoteSchema, createCustomerSchema, updateCustomerSchema, Customer, CustomerNote, CustomerTimelineEvent } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const crmService = new CrmService();

export async function getCustomersAction(workspaceId: string): Promise<Result<Customer[]>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return crmService.getWorkspaceCustomers(workspaceId);
}

export async function getCustomerDetailsAction(workspaceId: string, customerId: string): Promise<Result<{ customer: Customer; notes: CustomerNote[]; timeline: CustomerTimelineEvent[] }>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return crmService.getCustomerDetails(workspaceId, customerId);
}

export async function createCustomerAction(formData: unknown): Promise<Result<Customer>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  const parsed = createCustomerSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid customer parameters'));
  }

  return crmService.createCustomer(parsed.data);
}

export async function addCustomerNoteAction(formData: unknown): Promise<Result<CustomerNote>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  const parsed = addCustomerNoteSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid note content'));
  }

  return crmService.addNote(parsed.data);
}

export async function updateCustomerAction(formData: unknown): Promise<Result<Customer>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  const parsed = updateCustomerSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid customer parameters'));
  }

  return crmService.updateCustomer(parsed.data);
}

export async function deleteCustomerAction(workspaceId: string, customerId: string): Promise<Result<boolean>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return crmService.deleteCustomer(workspaceId, customerId);
}
