import { notFound, redirect } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { StaffService } from '@/features/staff/services/staff.service';
import { StaffList } from '@/features/staff/components/StaffList';

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function StaffPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspaceService = new WorkspaceService();

  const workspaceRes = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspaceRes.data) {
    notFound();
  }

  const workspace = workspaceRes.data;
  const staffService = new StaffService();

  const staffRes = await staffService.getWorkspaceStaff(workspace.id);

  if (staffRes.error && staffRes.error.code === 'MODULE_DISABLED') {
    redirect(`/${workspace.slug}/settings/modules`);
  }

  const staff = staffRes.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Staff Directory & Roster</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage employee roles, commission rates, and working rosters for <strong className="text-purple-300">{workspace.name}</strong>.
        </p>
      </div>

      <StaffList workspaceId={workspace.id} initialStaff={staff} />
    </div>
  );
}
