import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { CreateWorkspaceInput, ToggleModuleInput } from '@/types/workspace';
import { Workspace, WorkspaceMember, WorkspaceModule, ModuleKey } from '@/types/global';
import type { Database } from '@/types/database';

const DEFAULT_MODULES: ModuleKey[] = [
  'appointments',
  'queue',
  'crm',
  'services',
  'staff',
  'tasks',
  'invoices',
  'finance',
  'ai',
];

export class WorkspaceRepository {
  async createWorkspace(userId: string, input: CreateWorkspaceInput): Promise<Result<Workspace>> {
    try {
      const supabaseAdmin = createAdminSupabaseClient();

      // 1. Insert Workspace
      const wsInsert: Database['public']['Tables']['workspaces']['Insert'] = {
        name: input.name,
        slug: input.slug,
        industry_type: input.industryType,
      };

      const { data: rawWsData, error: wsError } = await supabaseAdmin
        .from('workspaces')
        .insert(wsInsert as never)
        .select()
        .single();

      if (wsError || !rawWsData) {
        return fail(AppErrorFactory.badRequest(wsError?.message || 'Failed to create workspace', 'WORKSPACE_CREATE_FAILED'));
      }

      const workspaceData = rawWsData as unknown as Database['public']['Tables']['workspaces']['Row'];

      // 2. Add Owner Member
      const memberInsert: Database['public']['Tables']['workspace_members']['Insert'] = {
        workspace_id: workspaceData.id,
        user_id: userId,
        role: 'owner',
      };

      const { error: memberError } = await supabaseAdmin.from('workspace_members').insert(memberInsert as never);

      if (memberError) {
        return fail(AppErrorFactory.internal(memberError.message, 'WORKSPACE_MEMBER_ADD_FAILED'));
      }

      // 3. Enable Default Modules
      const moduleInserts: Database['public']['Tables']['workspace_modules']['Insert'][] = DEFAULT_MODULES.map((key) => ({
        workspace_id: workspaceData.id,
        module_key: key,
        is_enabled: input.enabledModules ? input.enabledModules.includes(key) : true,
      }));

      const { error: moduleError } = await supabaseAdmin.from('workspace_modules').insert(moduleInserts as never);

      if (moduleError) {
        return fail(AppErrorFactory.internal(moduleError.message, 'WORKSPACE_MODULES_INIT_FAILED'));
      }

      const workspace: Workspace = {
        id: workspaceData.id,
        name: workspaceData.name,
        slug: workspaceData.slug,
        industryType: workspaceData.industry_type,
        logoUrl: workspaceData.logo_url,
        createdAt: workspaceData.created_at,
        updatedAt: workspaceData.updated_at,
      };

      return ok(workspace);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getUserWorkspaces(userId: string): Promise<Result<Workspace[]>> {
    try {
      const supabase = await createServerSupabaseClient();

      const { data: rawMembers, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userId);

      if (memberError) {
        return fail(AppErrorFactory.internal(memberError.message, 'FETCH_WORKSPACES_FAILED'));
      }

      const memberRows = (rawMembers || []) as unknown as { workspace_id: string }[];
      if (memberRows.length === 0) {
        return ok([]);
      }

      const workspaceIds = memberRows.map((m) => m.workspace_id);

      const { data: rawWsRows, error: wsError } = await supabase
        .from('workspaces')
        .select('*')
        .in('id', workspaceIds)
        .is('deleted_at', null);

      if (wsError) {
        return fail(AppErrorFactory.internal(wsError.message, 'FETCH_WORKSPACES_FAILED'));
      }

      const wsRows = (rawWsRows || []) as unknown as Database['public']['Tables']['workspaces']['Row'][];

      const workspaces: Workspace[] = wsRows.map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        industryType: w.industry_type,
        logoUrl: w.logo_url,
        createdAt: w.created_at,
        updatedAt: w.updated_at,
      }));

      return ok(workspaces);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getWorkspaceBySlug(slug: string): Promise<Result<Workspace | null>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: rawData, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('slug', slug)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'WORKSPACE_FETCH_FAILED'));
      }

      if (!rawData) {
        return ok(null);
      }

      const data = rawData as unknown as Database['public']['Tables']['workspaces']['Row'];

      return ok({
        id: data.id,
        name: data.name,
        slug: data.slug,
        industryType: data.industry_type,
        logoUrl: data.logo_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getWorkspaceById(id: string): Promise<Result<Workspace | null>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: rawData, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'WORKSPACE_FETCH_FAILED'));
      }

      if (!rawData) {
        return ok(null);
      }

      const data = rawData as unknown as Database['public']['Tables']['workspaces']['Row'];

      return ok({
        id: data.id,
        name: data.name,
        slug: data.slug,
        industryType: data.industry_type,
        logoUrl: data.logo_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getWorkspaceModules(workspaceId: string): Promise<Result<WorkspaceModule[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: rawData, error } = await supabase
        .from('workspace_modules')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'MODULES_FETCH_FAILED'));
      }

      const data = (rawData || []) as unknown as Database['public']['Tables']['workspace_modules']['Row'][];

      const modules: WorkspaceModule[] = data.map((m) => ({
        id: m.id,
        workspaceId: m.workspace_id,
        moduleKey: m.module_key as ModuleKey,
        isEnabled: m.is_enabled,
        settings: (m.settings as Record<string, unknown>) || {},
      }));

      return ok(modules);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async toggleModule(input: ToggleModuleInput): Promise<Result<boolean>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase
        .from('workspace_modules')
        .upsert({
          workspace_id: input.workspaceId,
          module_key: input.moduleKey,
          is_enabled: input.isEnabled,
        } as never, {
          onConflict: 'workspace_id,module_key'
        });

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'MODULE_TOGGLE_FAILED'));
      }

      return ok(true);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getMemberRole(workspaceId: string, userId: string): Promise<Result<WorkspaceMember | null>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: rawData, error } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'MEMBER_FETCH_FAILED'));
      }

      if (!rawData) {
        return ok(null);
      }

      const data = rawData as unknown as Database['public']['Tables']['workspace_members']['Row'];

      return ok({
        id: data.id,
        workspaceId: data.workspace_id,
        userId: data.user_id,
        role: data.role as WorkspaceMember['role'],
        joinedAt: data.joined_at,
      });
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }
}
