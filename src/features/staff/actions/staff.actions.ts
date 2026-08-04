'use server';

import { StaffService } from '../services/staff.service';
import { createStaffSchema, StaffMember } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const staffService = new StaffService();

export async function getStaffAction(workspaceId: string): Promise<Result<StaffMember[]>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return staffService.getWorkspaceStaff(workspaceId);
}

export async function createStaffAction(formData: unknown): Promise<Result<StaffMember>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  const parsed = createStaffSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid staff parameters'));
  }

  return staffService.createStaff(parsed.data);
}

export async function toggleStaffStatusAction(workspaceId: string, staffId: string, isActive: boolean): Promise<Result<boolean>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return staffService.toggleStaffStatus(workspaceId, staffId, isActive);
}

export async function deleteStaffAction(workspaceId: string, staffId: string): Promise<Result<boolean>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return staffService.deleteStaff(workspaceId, staffId);
}
