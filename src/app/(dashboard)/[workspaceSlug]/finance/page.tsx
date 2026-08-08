import { notFound, redirect } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { FinanceRepository } from '@/features/finance/repositories/finance.repository';
import { FinanceService } from '@/features/finance/services/finance.service';
import { FinanceDashboardClient } from '@/features/finance/components/FinanceDashboardClient';

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function FinancePage({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspaceService = new WorkspaceService();

  const workspaceRes = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspaceRes.data) {
    notFound();
  }

  const workspace = workspaceRes.data;
  const financeRepo = new FinanceRepository();
  const financeService = new FinanceService(financeRepo);

  const reportRes = await financeService.getFinancialReport(workspace.id, { range: 'THIS_MONTH' });

  if (reportRes.error && reportRes.error.code === 'MODULE_DISABLED') {
    redirect(`/${workspace.slug}/settings/modules`);
  }

  const defaultReportData = {
    kpis: { totalRevenue: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0, outstandingReceivables: 0, averageRevenue: 0 },
    expenses: [],
    revenueBreakdown: { byService: [], byCustomer: [], byStaff: [], byPaymentMethod: [] },
    expenseBreakdown: [],
    charts: { revenueVsExpenses: [], profitTrend: [] },
    healthInsights: [reportRes.error?.message || 'Please run the database SQL migrations to initialize the expenses table.']
  };

  const initialReportData = reportRes.data || defaultReportData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Finance & Profitability</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your business cash flow, profits, and record expenses for <strong className="text-primary font-semibold">{workspace.name}</strong>.
        </p>
      </div>

      <FinanceDashboardClient
        workspaceId={workspace.id}
        initialReportData={initialReportData}
      />
    </div>
  );
}
