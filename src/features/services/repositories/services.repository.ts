import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { CreateServiceInput, Service } from '../types';
import type { Database } from '@/types/database';

export class ServicesRepository {
  async getWorkspaceServices(workspaceId: string): Promise<Result<Service[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: rawData, error } = await supabase
        .from('services')
        .select('*')
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'SERVICES_FETCH_FAILED'));
      }

      const rows = (rawData || []) as unknown as Database['public']['Tables']['services']['Row'][];

      const services: Service[] = rows.map((r) => ({
        id: r.id,
        workspaceId: r.workspace_id,
        name: r.name,
        category: r.category,
        description: r.description,
        durationMin: r.duration_min,
        prepTimeMin: r.prep_time_min || 0,
        bufferTimeMin: r.buffer_time_min || 0,
        cleanupTimeMin: r.cleanup_time_min || 0,
        price: Number(r.price),
        taxRate: Number(r.tax_rate || 0),
        requiredSkill: r.required_skill || null,
        colorCode: r.color_code || '#8B5CF6',
        isFeatured: r.is_featured || false,
        isActive: r.is_active,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      return ok(services);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async createService(input: CreateServiceInput): Promise<Result<Service>> {
    try {
      const supabase = await createServerSupabaseClient();

      const insertPayload: Database['public']['Tables']['services']['Insert'] = {
        workspace_id: input.workspaceId,
        name: input.name,
        category: input.category || 'General',
        description: input.description || null,
        duration_min: input.durationMin || 30,
        prep_time_min: input.prepTimeMin || 0,
        buffer_time_min: input.bufferTimeMin || 0,
        cleanup_time_min: input.cleanupTimeMin || 0,
        price: input.price || 0,
        tax_rate: input.taxRate || 0,
        required_skill: input.requiredSkill || null,
        color_code: input.colorCode || '#8B5CF6',
        is_featured: input.isFeatured,
        is_active: input.isActive,
      };

      const { data: rawData, error } = await supabase
        .from('services')
        .insert(insertPayload as never)
        .select()
        .single();

      if (error || !rawData) {
        return fail(AppErrorFactory.badRequest(error?.message || 'Failed to create service', 'SERVICE_CREATE_FAILED'));
      }

      const r = rawData as unknown as Database['public']['Tables']['services']['Row'];

      const service: Service = {
        id: r.id,
        workspaceId: r.workspace_id,
        name: r.name,
        category: r.category,
        description: r.description,
        durationMin: r.duration_min,
        prepTimeMin: r.prep_time_min || 0,
        bufferTimeMin: r.buffer_time_min || 0,
        cleanupTimeMin: r.cleanup_time_min || 0,
        price: Number(r.price),
        taxRate: Number(r.tax_rate || 0),
        requiredSkill: r.required_skill || null,
        colorCode: r.color_code || '#8B5CF6',
        isFeatured: r.is_featured || false,
        isActive: r.is_active,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };

      return ok(service);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async toggleServiceStatus(workspaceId: string, serviceId: string, isActive: boolean): Promise<Result<boolean>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase
        .from('services')
        .update({ is_active: isActive, updated_at: new Date().toISOString() } as never)
        .eq('id', serviceId)
        .eq('workspace_id', workspaceId);

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'SERVICE_TOGGLE_FAILED'));
      }

      return ok(true);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }
}
