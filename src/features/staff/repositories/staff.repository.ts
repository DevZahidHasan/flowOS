import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { CreateStaffInput, StaffMember } from '../types';
import type { Database } from '@/types/database';

export class StaffRepository {
  async getWorkspaceStaff(workspaceId: string): Promise<Result<StaffMember[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: rawData, error } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('display_name', { ascending: true });

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'STAFF_FETCH_FAILED'));
      }

      const rows = (rawData || []) as unknown as Database['public']['Tables']['staff_profiles']['Row'][];

      const staff: StaffMember[] = rows.map((r) => ({
        id: r.id,
        workspaceId: r.workspace_id,
        userId: r.user_id,
        displayName: r.display_name,
        roleTitle: r.role_title,
        email: r.email,
        phone: r.phone,
        avatarUrl: r.avatar_url,
        commissionRate: Number(r.commission_rate),
        specialties: r.specialties || [],
        skills: r.skills || [],
        isActive: r.is_active,
        averageRating: Number(r.average_rating),
        completedAppointments: r.completed_appointments,
        totalRevenueGenerated: Number(r.total_revenue_generated),
        createdAt: r.created_at,
      }));

      return ok(staff);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async createStaff(input: CreateStaffInput): Promise<Result<StaffMember>> {
    try {
      const supabase = await createServerSupabaseClient();

      const insertPayload: Database['public']['Tables']['staff_profiles']['Insert'] = {
        workspace_id: input.workspaceId,
        display_name: input.displayName,
        role_title: input.roleTitle || 'Staff Member',
        email: input.email || null,
        phone: input.phone || null,
        commission_rate: input.commissionRate || 0,
        specialties: input.specialties || [],
        skills: input.skills || [],
        is_active: input.isActive,
      };

      const { data: rawData, error } = await supabase
        .from('staff_profiles')
        .insert(insertPayload as never)
        .select()
        .single();

      if (error || !rawData) {
        return fail(AppErrorFactory.badRequest(error?.message || 'Failed to add staff member', 'STAFF_CREATE_FAILED'));
      }

      const r = rawData as unknown as Database['public']['Tables']['staff_profiles']['Row'];

      const member: StaffMember = {
        id: r.id,
        workspaceId: r.workspace_id,
        userId: r.user_id,
        displayName: r.display_name,
        roleTitle: r.role_title,
        email: r.email,
        phone: r.phone,
        avatarUrl: r.avatar_url,
        commissionRate: Number(r.commission_rate),
        specialties: r.specialties || [],
        skills: r.skills || [],
        isActive: r.is_active,
        averageRating: Number(r.average_rating),
        completedAppointments: r.completed_appointments,
        totalRevenueGenerated: Number(r.total_revenue_generated),
        createdAt: r.created_at,
      };

      return ok(member);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async toggleStaffStatus(workspaceId: string, staffId: string, isActive: boolean): Promise<Result<boolean>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase
        .from('staff_profiles')
        .update({ is_active: isActive } as never)
        .eq('id', staffId)
        .eq('workspace_id', workspaceId);

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'STAFF_TOGGLE_FAILED'));
      }

      return ok(true);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }
}
