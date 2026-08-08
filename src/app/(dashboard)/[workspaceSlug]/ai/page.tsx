import { notFound, redirect } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { AIDashboardClient } from '@/features/ai/components/AIDashboardClient';

interface PageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function AIPage({ params }: PageProps) {
  const { workspaceSlug } = await params;
  const workspaceService = new WorkspaceService();

  const workspaceRes = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspaceRes.data) {
    notFound();
  }

  const workspace = workspaceRes.data;

  // Verify that the AI module is enabled for the workspace
  const moduleCheck = await workspaceService.isModuleEnabled(workspace.id, 'ai');
  if (moduleCheck.error || !moduleCheck.data) {
    redirect(`/${workspace.slug}/settings/modules`);
  }

  return (
    <AIDashboardClient 
      workspaceId={workspace.id} 
      workspaceSlug={workspace.slug} 
    />
  );
}
