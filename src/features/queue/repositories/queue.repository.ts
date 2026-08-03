import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { CreateTokenInput, QueueToken, UpdateTokenStatusInput } from '../types';
import type { Database } from '@/types/database';

export class QueueRepository {
  async getWorkspaceTokens(workspaceId: string): Promise<Result<QueueToken[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: rawData, error } = await supabase
        .from('queue_tokens')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true });

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'QUEUE_FETCH_FAILED'));
      }

      const rows = (rawData || []) as unknown as Database['public']['Tables']['queue_tokens']['Row'][];

      const tokens: QueueToken[] = rows.map((r) => ({
        id: r.id,
        workspaceId: r.workspace_id,
        tokenNumber: r.token_number,
        customerName: r.customer_name,
        customerPhone: r.customer_phone,
        serviceName: r.service_name,
        status: r.status as QueueToken['status'],
        estimatedWaitMin: r.estimated_wait_min,
        servedAt: r.served_at,
        completedAt: r.completed_at,
        createdAt: r.created_at,
      }));

      return ok(tokens);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async createToken(input: CreateTokenInput): Promise<Result<QueueToken>> {
    try {
      const supabase = await createServerSupabaseClient();

      // Count existing tokens today for sequential numbering
      const { count } = await supabase
        .from('queue_tokens')
        .select('id', { count: 'exact', head: true })
        .eq('workspace_id', input.workspaceId);

      const nextNum = (count || 0) + 1;
      const tokenNumber = `#Q-${100 + nextNum}`;

      const insertPayload: Database['public']['Tables']['queue_tokens']['Insert'] = {
        workspace_id: input.workspaceId,
        token_number: tokenNumber,
        customer_name: input.customerName,
        customer_phone: input.customerPhone || null,
        service_name: input.serviceName || null,
        estimated_wait_min: input.estimatedWaitMin || 15,
        status: 'WAITING',
      };

      const { data: rawData, error } = await supabase
        .from('queue_tokens')
        .insert(insertPayload as never)
        .select()
        .single();

      if (error || !rawData) {
        return fail(AppErrorFactory.badRequest(error?.message || 'Failed to issue token', 'TOKEN_CREATE_FAILED'));
      }

      const r = rawData as unknown as Database['public']['Tables']['queue_tokens']['Row'];

      const token: QueueToken = {
        id: r.id,
        workspaceId: r.workspace_id,
        tokenNumber: r.token_number,
        customerName: r.customer_name,
        customerPhone: r.customer_phone,
        serviceName: r.service_name,
        status: r.status as QueueToken['status'],
        estimatedWaitMin: r.estimated_wait_min,
        servedAt: r.served_at,
        completedAt: r.completed_at,
        createdAt: r.created_at,
      };

      return ok(token);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async updateTokenStatus(input: UpdateTokenStatusInput): Promise<Result<boolean>> {
    try {
      const supabase = await createServerSupabaseClient();

      const updateData: Record<string, unknown> = {
        status: input.status,
      };

      if (input.status === 'SERVING') {
        updateData.served_at = new Date().toISOString();
      } else if (input.status === 'COMPLETED') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('queue_tokens')
        .update(updateData as never)
        .eq('id', input.tokenId)
        .eq('workspace_id', input.workspaceId);

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'TOKEN_UPDATE_FAILED'));
      }

      return ok(true);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }
}
