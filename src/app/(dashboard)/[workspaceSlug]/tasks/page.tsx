import { notFound, redirect } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { TaskService } from '@/features/tasks/services/task.service';
import { TaskRepository } from '@/features/tasks/repositories/task.repository';
import { TasksDashboardClient } from '@/features/tasks/components/TasksDashboardClient';

interface PageProps {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TasksPage({ params, searchParams }: PageProps) {
  const { workspaceSlug } = await params;
  const resolvedSearchParams = await searchParams;
  
  const workspaceService = new WorkspaceService();

  const workspaceRes = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspaceRes.data) {
    notFound();
  }

  const workspace = workspaceRes.data;
  const taskRepo = new TaskRepository();
  const taskService = new TaskService(taskRepo);

  const filters = {
    workspaceId: workspace.id,
    search: typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined,
    status: typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : undefined,
    priority: typeof resolvedSearchParams.priority === 'string' ? resolvedSearchParams.priority : undefined,
    sort: typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined,
    category: typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined,
    assigneeId: typeof resolvedSearchParams.assigneeId === 'string' ? resolvedSearchParams.assigneeId : undefined,
  };

  const tasksRes = await taskService.getWorkspaceTasks(filters);

  if (tasksRes.error && tasksRes.error.code === 'MODULE_DISABLED') {
    redirect(`/${workspace.slug}/settings/modules`);
  }

  const tasks = tasksRes.data || [];
  const isFiltered = Object.keys(resolvedSearchParams).length > 0;

  return (
    <TasksDashboardClient
      workspaceId={workspace.id}
      workspaceSlug={workspace.slug}
      initialTasks={tasks}
      isFiltered={isFiltered}
    />
  );
}
