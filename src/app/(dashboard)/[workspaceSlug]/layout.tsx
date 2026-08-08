import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { AuthService } from '@/features/auth/services/auth.service';
import { DashboardLayoutShell } from '@/components/layout/DashboardLayoutShell';

interface Props {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}

export default async function DashboardLayout({ children, params }: Props) {
  const { workspaceSlug } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const workspaceService = new WorkspaceService();
  const { requireApprovedUser } = await import('@/lib/authorization');
  
  const profile = await requireApprovedUser();

  const [workspaceRes, userWorkspacesRes] = await Promise.all([
    workspaceService.getWorkspaceBySlug(workspaceSlug),
    workspaceService.getUserWorkspaces(user.id),
  ]);

  if (!workspaceRes.data) {
    notFound();
  }

  const currentWorkspace = workspaceRes.data;
  const userWorkspaces = userWorkspacesRes.data || [];

  // Verify workspace membership (cross-tenant access guard)
  const isMember = userWorkspaces.some((w) => w.id === currentWorkspace.id);
  if (!isMember && profile.platformRole !== 'platform_admin') {
    redirect('/unauthorized');
  }

  // Fetch modules for active workspace
  const modulesRes = await workspaceService.getWorkspaceModules(currentWorkspace.id);
  const modules = modulesRes.data || [];

  return (
    <DashboardLayoutShell
      currentWorkspace={currentWorkspace}
      userWorkspaces={userWorkspaces}
      modules={modules}
      profile={profile}
    >
      {children}
    </DashboardLayoutShell>
  );
}
