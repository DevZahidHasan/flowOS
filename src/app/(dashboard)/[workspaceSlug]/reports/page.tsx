import { notFound, redirect } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { ReportsService } from '@/features/reports/services/reports.service';
import { ReportsDashboard } from '@/features/reports/components/ReportsDashboard';

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function ReportsPage({ params }: Props) {
  const { workspaceSlug } = await params;

  const workspaceService = new WorkspaceService();
  const workspaceRes = await workspaceService.getWorkspaceBySlug(workspaceSlug);

  if (!workspaceRes.data) {
    notFound();
  }
  const workspace = workspaceRes.data;

  // Verify the reports module is enabled
  const modulesRes = await workspaceService.getWorkspaceModules(workspace.id);
  const modules = modulesRes.data || [];
  const reportsModule = modules.find((m) => m.moduleKey === 'reports');

  if (!reportsModule || !reportsModule.isEnabled) {
    redirect(`/${workspace.slug}?error=reports_module_disabled`);
  }

  // Fetch initial report data for LAST_30_DAYS
  const reportsService = new ReportsService();
  const reportRes = await reportsService.getFinancialReport(workspace.id, 'LAST_30_DAYS');

  if (reportRes.error || !reportRes.data) {
    throw new Error(reportRes.error?.message || 'Failed to load financial report data.');
  }

  return (
    <ReportsDashboard
      workspaceId={workspace.id}
      initialData={reportRes.data}
    />
  );
}
