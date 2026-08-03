'use server';

import { QueueService } from '../services/queue.service';
import { createTokenSchema, updateTokenStatusSchema, QueueToken } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const queueService = new QueueService();

export async function getQueueTokensAction(workspaceId: string): Promise<Result<QueueToken[]>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return queueService.getWorkspaceTokens(workspaceId);
}

export async function createQueueTokenAction(formData: unknown): Promise<Result<QueueToken>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  const parsed = createTokenSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid token parameters'));
  }

  return queueService.createToken(parsed.data);
}

export async function updateQueueTokenStatusAction(formData: unknown): Promise<Result<boolean>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  const parsed = updateTokenStatusSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid status payload'));
  }

  return queueService.updateTokenStatus(parsed.data);
}
