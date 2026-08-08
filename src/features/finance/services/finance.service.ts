import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { IFinanceRepository } from '../repositories/finance.repository.interface';
import { 
  Expense, CreateExpenseInput, UpdateExpenseInput, 
  FinanceFilters, FinancialReportData, ExpenseCategory, FinanceDateRange
} from '../types';

export class FinanceService {
  private repo: IFinanceRepository;
  private workspaceService: WorkspaceService;

  constructor(repo: IFinanceRepository, workspaceService?: WorkspaceService) {
    this.repo = repo;
    this.workspaceService = workspaceService || new WorkspaceService();
  }

  private async assertFinanceModuleEnabled(workspaceId: string): Promise<Result<boolean>> {
    const check = await this.workspaceService.isModuleEnabled(workspaceId, 'finance');
    if (check.error) return fail(check.error);
    if (!check.data) {
      return fail(AppErrorFactory.forbidden('Finance module is disabled for this workspace.', 'MODULE_DISABLED'));
    }
    return check;
  }

  async getExpenses(
    workspaceId: string,
    filters?: FinanceFilters
  ): Promise<Result<Expense[]>> {
    const check = await this.assertFinanceModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (filters?.startDate) {
      startDate = new Date(filters.startDate);
    }
    if (filters?.endDate) {
      endDate = new Date(filters.endDate);
    }

    const res = await this.repo.getExpenses(workspaceId, startDate, endDate);
    if (res.error) return fail(res.error);

    let expenses = res.data;
    if (filters?.category) {
      expenses = expenses.filter((e) => e.category === filters.category);
    }

    return ok(expenses);
  }

  async getExpenseById(workspaceId: string, expenseId: string): Promise<Result<Expense>> {
    const check = await this.assertFinanceModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    return this.repo.getExpenseById(workspaceId, expenseId);
  }

  async createExpense(
    workspaceId: string,
    input: CreateExpenseInput,
    userId: string
  ): Promise<Result<Expense>> {
    const check = await this.assertFinanceModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    return this.repo.createExpense(workspaceId, input, userId);
  }

  async updateExpense(
    workspaceId: string,
    expenseId: string,
    input: UpdateExpenseInput
  ): Promise<Result<Expense>> {
    const check = await this.assertFinanceModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    return this.repo.updateExpense(workspaceId, expenseId, input);
  }

  async deleteExpense(workspaceId: string, expenseId: string): Promise<Result<boolean>> {
    const check = await this.assertFinanceModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    return this.repo.deleteExpense(workspaceId, expenseId);
  }

  async getFinancialReport(
    workspaceId: string,
    filters: FinanceFilters
  ): Promise<Result<FinancialReportData>> {
    const check = await this.assertFinanceModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    const { start, end } = resolveDateRange(filters.range, filters.startDate, filters.endDate);

    const [expensesRes, paymentsRes, invoicesRes] = await Promise.all([
      this.repo.getExpenses(workspaceId, start, end),
      this.repo.getPayments(workspaceId, start, end),
      this.repo.getInvoices(workspaceId),
    ]);

    if (expensesRes.error) return fail(expensesRes.error);
    if (paymentsRes.error) return fail(paymentsRes.error);
    if (invoicesRes.error) return fail(invoicesRes.error);

    const expenses = expensesRes.data;
    const payments = paymentsRes.data;
    const allInvoices = invoicesRes.data;

    // 1. Calculate KPIs
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const outstandingReceivables = allInvoices
      .filter((inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED' && inv.status !== 'REFUNDED')
      .reduce((sum, inv) => sum + inv.total_amount, 0);

    const daysDiff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const averageRevenue = totalRevenue / daysDiff;

    // 2. Revenue Breakdowns
    const serviceMap = new Map<string, number>();
    const customerMap = new Map<string, number>();
    const staffMap = new Map<string, number>();
    const methodMap = new Map<string, number>();

    payments.forEach((p) => {
      const amount = p.amount;
      const serviceName = p.invoices?.appointments?.services?.name || 'Custom Invoice';
      const staffName = p.invoices?.appointments?.staff_profiles?.display_name || 'House Staff';
      const customerName = p.invoices?.customers?.full_name || 'Guest Customer';
      const method = p.payment_method || 'Other';

      serviceMap.set(serviceName, (serviceMap.get(serviceName) || 0) + amount);
      customerMap.set(customerName, (customerMap.get(customerName) || 0) + amount);
      staffMap.set(staffName, (staffMap.get(staffName) || 0) + amount);
      methodMap.set(method, (methodMap.get(method) || 0) + amount);
    });

    const byService = Array.from(serviceMap.entries()).map(([serviceName, amount]) => ({
      serviceName,
      amount,
      percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    const byCustomer = Array.from(customerMap.entries()).map(([customerName, amount]) => ({
      customerName,
      amount,
      percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    const byStaff = Array.from(staffMap.entries()).map(([staffName, amount]) => ({
      staffName,
      amount,
      percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    const byPaymentMethod = Array.from(methodMap.entries()).map(([paymentMethod, amount]) => ({
      paymentMethod,
      amount,
      percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    // 3. Expense Breakdowns
    const expenseMap = new Map<ExpenseCategory, number>();
    expenses.forEach((e) => {
      expenseMap.set(e.category, (expenseMap.get(e.category) || 0) + e.amount);
    });

    const expenseBreakdown = Array.from(expenseMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    // 4. Charts Generation
    const chartDates: string[] = [];
    let curr = new Date(start);

    if (daysDiff <= 31) {
      while (curr <= end) {
        chartDates.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
    } else {
      while (curr <= end) {
        const key = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
        if (!chartDates.includes(key)) {
          chartDates.push(key);
        }
        curr.setMonth(curr.getMonth() + 1);
      }
    }

    const revenueVsExpenses = chartDates.map((dateStr) => {
      let periodRevenue = 0;
      let periodExpenses = 0;

      if (daysDiff <= 31) {
        const targetDate = new Date(dateStr);
        periodRevenue = payments
          .filter((p) => {
            const pDate = new Date(p.payment_date);
            return pDate.toDateString() === targetDate.toDateString();
          })
          .reduce((sum, p) => sum + p.amount, 0);

        periodExpenses = expenses
          .filter((e) => {
            const eDate = new Date(e.expenseDate);
            return eDate.toDateString() === targetDate.toDateString();
          })
          .reduce((sum, e) => sum + e.amount, 0);
      } else {
        periodRevenue = payments
          .filter((p) => p.payment_date.startsWith(dateStr))
          .reduce((sum, p) => sum + p.amount, 0);

        periodExpenses = expenses
          .filter((e) => e.expenseDate.startsWith(dateStr))
          .reduce((sum, e) => sum + e.amount, 0);
      }

      return {
        date: dateStr,
        revenue: periodRevenue,
        expenses: periodExpenses,
      };
    });

    const profitTrend = revenueVsExpenses.map((c) => ({
      date: c.date,
      profit: c.revenue - c.expenses,
    }));

    // 5. Insights Generation
    const healthInsights: string[] = [];
    if (totalRevenue > 0) {
      if (profitMargin > 25) {
        healthInsights.push(`Strong profit margin of ${profitMargin.toFixed(1)}%! Keep operating costs optimized.`);
      } else if (profitMargin < 10) {
        healthInsights.push(`Low profit margin (${profitMargin.toFixed(1)}%). Consider increasing service rates or reducing overhead expenses.`);
      }

      if (outstandingReceivables > totalRevenue * 0.3) {
        healthInsights.push(`High outstanding receivables ($${outstandingReceivables.toFixed(2)}). Send automated payment reminders to open invoices.`);
      }

      const topService = byService[0];
      if (topService && topService.percentage > 40) {
        healthInsights.push(`Service "${topService.serviceName}" generates ${topService.percentage.toFixed(1)}% of your revenue. Consider bundle packages.`);
      }
    } else {
      healthInsights.push('No revenue recorded in this period. Open invoices and accept payments to view charts.');
    }

    if (totalExpenses > 0) {
      const topExpense = expenseBreakdown[0];
      if (topExpense) {
        healthInsights.push(`Operational expense is led by "${topExpense.category}" which accounts for ${topExpense.percentage.toFixed(1)}% of total spend.`);
      }
    }

    return ok({
      kpis: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        outstandingReceivables,
        averageRevenue,
      },
      expenses,
      revenueBreakdown: {
        byService,
        byCustomer,
        byStaff,
        byPaymentMethod,
      },
      expenseBreakdown,
      charts: {
        revenueVsExpenses,
        profitTrend,
      },
      healthInsights,
    });
  }
}

function resolveDateRange(range: FinanceDateRange, customStart?: string, customEnd?: string): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  switch (range) {
    case 'TODAY':
      break;
    case 'THIS_WEEK': {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      end.setDate(start.getDate() + 6);
      break;
    }
    case 'THIS_MONTH':
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      break;
    case 'LAST_MONTH':
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      end.setMonth(end.getMonth());
      end.setDate(0);
      break;
    case 'LAST_30_DAYS':
      start.setDate(start.getDate() - 30);
      break;
    case 'THIS_QUARTER': {
      const quarter = Math.floor(start.getMonth() / 3);
      start.setMonth(quarter * 3);
      start.setDate(1);
      break;
    }
    case 'THIS_YEAR':
      start.setMonth(0);
      start.setDate(1);
      end.setMonth(11);
      end.setDate(31);
      break;
    case 'CUSTOM':
      if (customStart) {
        const s = new Date(customStart);
        if (!isNaN(s.getTime())) start.setTime(s.getTime());
      }
      if (customEnd) {
        const e = new Date(customEnd);
        if (!isNaN(e.getTime())) end.setTime(e.getTime());
      }
      break;
  }

  return { start, end };
}
