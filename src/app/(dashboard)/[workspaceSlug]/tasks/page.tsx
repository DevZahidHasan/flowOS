import { notFound, redirect } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { TaskService } from '@/features/tasks/services/task.service';
import { TaskRepository } from '@/features/tasks/repositories/task.repository';
import { StaffRepository } from '@/features/staff/repositories/staff.repository';
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
  const staffRepo = new StaffRepository();

  const filters = {
    workspaceId: workspace.id,
    search: typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined,
    status: typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : undefined,
    priority: typeof resolvedSearchParams.priority === 'string' ? resolvedSearchParams.priority : undefined,
    sort: typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined,
    category: typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined,
    assigneeId: typeof resolvedSearchParams.assigneeId === 'string' ? resolvedSearchParams.assigneeId : undefined,
    archived: resolvedSearchParams.archived === 'true',
    trash: resolvedSearchParams.trash === 'true',
    overdue: resolvedSearchParams.overdue === 'true',
  };

  const tasksRes = await taskService.getWorkspaceTasks(filters);
  const statsRes = await taskService.getTaskStatistics(workspace.id);
  const staffRes = await staffRepo.getWorkspaceStaff(workspace.id);

  if (tasksRes.error && tasksRes.error.code === 'MODULE_DISABLED') {
    redirect(`/${workspace.slug}/settings/modules`);
  }

  const tasks = tasksRes.data || [];
  const stats = statsRes.data || null;
  const staff = staffRes.data || [];
  const isFiltered = Object.keys(resolvedSearchParams).length > 0;

  return (
    <TasksDashboardClient
      workspaceId={workspace.id}
      workspaceSlug={workspace.slug}
      initialTasks={tasks}
      initialStats={stats}
      initialStaff={staff}
      isFiltered={isFiltered}
    />
  );
}
