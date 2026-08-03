import { notFound, redirect } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { QueueService } from '@/features/queue/services/queue.service';
import { QueueDisplay } from '@/features/queue/components/QueueDisplay';

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function QueuePage({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspaceService = new WorkspaceService();

  const workspaceRes = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspaceRes.data) {
    notFound();
  }

  const workspace = workspaceRes.data;
  const queueService = new QueueService();

  const tokensRes = await queueService.getWorkspaceTokens(workspace.id);

  if (tokensRes.error && tokensRes.error.code === 'MODULE_DISABLED') {
    redirect(`/${workspace.slug}/settings/modules`);
  }

  const tokens = tokensRes.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Queue Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Issue token numbers, monitor live waitlists, and manage walk-in queues for <strong className="text-purple-300">{workspace.name}</strong>.
        </p>
      </div>

      <QueueDisplay workspaceId={workspace.id} initialTokens={tokens} />
    </div>
  );
}
