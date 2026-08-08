import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UserProfile, WorkspaceRole } from '@/types/global';
import type { Database } from '@/types/database';

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createServerSupabaseClient();
  const { data: rawData, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !rawData) return null;

  const data = rawData as Database['public']['Tables']['profiles']['Row'];

  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    avatarUrl: data.avatar_url,
    platformRole: data.platform_role,
    accountStatus: data.account_status,
    isApproved: data.is_approved,
    canCreateWorkspace: data.can_create_workspace,
    createdAt: data.created_at,
  };
}

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireApprovedUser(): Promise<UserProfile> {
  await requireAuthenticatedUser();
  const profile = await getCurrentProfile();
  
  if (!profile) {
    redirect('/login');
  }

  if (profile.accountStatus === 'pending' || !profile.isApproved) {
    redirect('/account/pending');
  }

  if (profile.accountStatus === 'rejected') {
    redirect('/account/rejected');
  }

  if (profile.accountStatus === 'suspended') {
    redirect('/account/suspended');
  }

  return profile;
}

export async function requirePlatformAdmin(): Promise<UserProfile> {
  const profile = await requireApprovedUser();
  if (profile.platformRole !== 'platform_admin') {
    redirect('/unauthorized');
  }
  return profile;
}

export async function requireWorkspaceMember(workspaceId: string) {
  const user = await requireAuthenticatedUser();
  const supabase = await createServerSupabaseClient();
  
  const { data: membership, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (error || !membership) {
    redirect('/unauthorized');
  }

  const data = membership as unknown as { role: WorkspaceRole };
  return data.role;
}

export async function requireWorkspaceOwner(workspaceId: string) {
  const role = await requireWorkspaceMember(workspaceId);
  if (role !== 'owner') {
    redirect('/unauthorized');
  }
}

export async function requireWorkspaceManager(workspaceId: string) {
  const role = await requireWorkspaceMember(workspaceId);
  if (role !== 'owner' && role !== 'manager') {
    redirect('/unauthorized');
  }
}

export async function canCreateWorkspace(): Promise<boolean> {
  const profile = await getCurrentProfile();
  if (!profile) return false;
  return (
    profile.accountStatus === 'active' &&
    profile.isApproved &&
    profile.canCreateWorkspace
  );
}
