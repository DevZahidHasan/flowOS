'use server';

import { ServicesService } from '../services/services.service';
import { createServiceSchema, updateServiceSchema, Service } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const servicesService = new ServicesService();

export async function getServicesAction(workspaceId: string): Promise<Result<Service[]>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return servicesService.getWorkspaceServices(workspaceId);
}

export async function createServiceAction(formData: unknown): Promise<Result<Service>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  const parsed = createServiceSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid service parameters'));
  }

  return servicesService.createService(parsed.data);
}

export async function toggleServiceStatusAction(workspaceId: string, serviceId: string, isActive: boolean): Promise<Result<boolean>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return servicesService.toggleServiceStatus(workspaceId, serviceId, isActive);
}

export async function updateServiceAction(formData: unknown): Promise<Result<Service>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  const parsed = updateServiceSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid service parameters'));
  }

  return servicesService.updateService(parsed.data);
}
