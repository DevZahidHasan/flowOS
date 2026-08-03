'use server';

import { WorkspaceService } from '../services/workspace.service';
import { createWorkspaceSchema, toggleModuleSchema } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Workspace, WorkspaceModule } from '@/types/global';

const workspaceService = new WorkspaceService();

export async function createWorkspaceAction(formData: unknown): Promise<Result<Workspace>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('User session not found'));
  }

  const parsed = createWorkspaceSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid workspace payload'));
  }

  return workspaceService.createWorkspace(user.id, parsed.data);
}

export async function toggleModuleAction(formData: unknown): Promise<Result<boolean>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('User session not found'));
  }

  const parsed = toggleModuleSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid toggle payload'));
  }

  return workspaceService.toggleModule(user.id, parsed.data);
}

export async function getWorkspaceModulesAction(workspaceId: string): Promise<Result<WorkspaceModule[]>> {
  return workspaceService.getWorkspaceModules(workspaceId);
}
