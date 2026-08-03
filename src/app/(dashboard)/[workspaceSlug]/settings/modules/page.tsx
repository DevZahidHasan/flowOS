import { notFound } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { ModuleToggleList } from '@/features/workspace/components/ModuleToggleList';

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function ModuleStorePage({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspaceService = new WorkspaceService();

  const workspaceRes = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspaceRes.data) {
    notFound();
  }

  const workspace = workspaceRes.data;
  const modulesRes = await workspaceService.getWorkspaceModules(workspace.id);
  const modules = modulesRes.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">FlowOS Module Store</h1>
        <p className="text-sm text-slate-400 mt-1">
          Enable or disable operational modules tailored for <strong className="text-purple-300">{workspace.name}</strong> ({workspace.industryType}).
        </p>
      </div>

      <ModuleToggleList workspaceId={workspace.id} initialModules={modules} />
    </div>
  );
}
