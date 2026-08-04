import { ReportsRepository, RawInvoiceRow, RawPaymentRow } from '../repositories/reports.repository';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { Result, fail, ok } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import {
  FinancialReportData,
  FinancialKpis,
  PaymentMethodBreakdown,
  InvoiceStatusBreakdown,
  MonthlySummaryRow,
  TopCustomerRow,
  BusinessInsight,
  DateRangeFilterType,
} from '../types';

export function getDateRangeForFilter(
  filterType: DateRangeFilterType,
  customStart?: string,
  customEnd?: string
): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  const startOfDay = (d: Date) => {
    const res = new Date(d);
    res.setHours(0, 0, 0, 0);
    return res;
  };
  const endOfDay = (d: Date) => {
    const res = new Date(d);
    res.setHours(23, 59, 59, 999);
    return res;
  };

  switch (filterType) {
    case 'TODAY':
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case 'THIS_WEEK': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = startOfDay(new Date(now.setDate(diff)));
      end = endOfDay(new Date());
      break;
    }
    case 'LAST_7_DAYS':
      start = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
      end = endOfDay(new Date());
      break;
    case 'THIS_MONTH':
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = endOfDay(new Date());
      break;
    case 'LAST_30_DAYS':
      start = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
      end = endOfDay(new Date());
      break;
    case 'THIS_QUARTER': {
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1, 0, 0, 0, 0);
      end = endOfDay(new Date());
      break;
    }
    case 'THIS_YEAR':
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      end = endOfDay(new Date());
      break;
    case 'CUSTOM':
      start = customStart ? startOfDay(new Date(customStart)) : startOfDay(now);
      end = customEnd ? endOfDay(new Date(customEnd)) : endOfDay(now);
      break;
    default:
      start = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
      end = endOfDay(new Date());
  }

  const duration = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);

  return { start, end, prevStart, prevEnd };
}

export class ReportsService {
  private repo: ReportsRepository;
  private workspaceService: WorkspaceService;

  constructor(repo?: ReportsRepository, workspaceService?: WorkspaceService) {
    this.repo = repo || new ReportsRepository();
    this.workspaceService = workspaceService || new WorkspaceService();
  }

  private async assertReportsModuleEnabled(workspaceId: string): Promise<Result<boolean>> {
    const check = await this.workspaceService.isModuleEnabled(workspaceId, 'reports');
    if (check.error) return fail(check.error);
    if (!check.data) {
      return fail(
        AppErrorFactory.forbidden(
          'Reports module is disabled for this workspace. Enable it in Settings.',
          'MODULE_DISABLED'
        )
      );
    }
    return check;
  }

  async getFinancialReport(
    workspaceId: string,
    filterType: DateRangeFilterType,
    customStart?: string,
    customEnd?: string
  ): Promise<Result<FinancialReportData>> {
    try {
      const moduleCheck = await this.assertReportsModuleEnabled(workspaceId);
      if (moduleCheck.error) return fail(moduleCheck.error);

      // Compute date ranges
      const { start, end, prevStart, prevEnd } = getDateRangeForFilter(
        filterType,
        customStart,
        customEnd
      );

      // Fetch active invoices and payments in the combined date range (prevStart to end)
      const invoicesRes = await this.repo.getInvoices(workspaceId, prevStart, end);
      if (invoicesRes.error) return fail(invoicesRes.error);
      const allInvoices = invoicesRes.data;

      const paymentsRes = await this.repo.getPayments(workspaceId, prevStart, end);
      if (paymentsRes.error) return fail(paymentsRes.error);
      const allPayments = paymentsRes.data;

      // Extract unique invoice IDs to fetch all-time payments for outstanding calculation
      const invoiceIds = allInvoices.map((inv) => inv.id);
      let lifetimePayments: RawPaymentRow[] = [];
      if (invoiceIds.length > 0) {
        // Query payments repository for all-time payments of these specific invoices
        // We can reuse getPayments by passing undefined dates to get all-time records
        const allPaymentsRes = await this.repo.getPayments(workspaceId);
        if (allPaymentsRes.error) return fail(allPaymentsRes.error);
        lifetimePayments = allPaymentsRes.data.filter(
          (p) => p.invoice_id && invoiceIds.includes(p.invoice_id)
        );
      }

      // Map invoice lifetime payments
      const invoicePaidSums = new Map<string, number>();
      for (const pay of lifetimePayments) {
        const currentSum = invoicePaidSums.get(pay.invoice_id) || 0;
        invoicePaidSums.set(pay.invoice_id, currentSum + Number(pay.amount));
      }

      // Helper to calculate outstanding balance for an invoice
      const getInvoiceOutstanding = (inv: RawInvoiceRow) => {
        if (inv.status === 'CANCELLED') return 0;
        const paidAmount = invoicePaidSums.get(inv.id) || 0;
        return Math.max(0, Number(inv.total_amount) - paidAmount);
      };

      // Split invoices into current and previous periods
      const currentInvoices = allInvoices.filter(
        (inv) => new Date(inv.issue_date) >= start && new Date(inv.issue_date) <= end
      );
      const prevInvoices = allInvoices.filter(
        (inv) => new Date(inv.issue_date) >= prevStart && new Date(inv.issue_date) <= prevEnd
      );

      // Split payments into current and previous periods
      const currentPayments = allPayments.filter(
        (p) => new Date(p.payment_date) >= start && new Date(p.payment_date) <= end
      );
      const prevPayments = allPayments.filter(
        (p) => new Date(p.payment_date) >= prevStart && new Date(p.payment_date) <= prevEnd
      );

      // Calculate current KPIs
      const totalRevenue = currentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalInvoiced = currentInvoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
      const outstandingBalance = currentInvoices.reduce(
        (sum, inv) => sum + getInvoiceOutstanding(inv),
        0
      );
      const invoiceCount = currentInvoices.length;
      const averageInvoiceValue = invoiceCount > 0 ? totalInvoiced / invoiceCount : 0;
      const collectionRate = totalInvoiced > 0 ? (totalRevenue / totalInvoiced) * 100 : 0;

      const paidInvoiceCount = currentInvoices.filter((inv) => inv.status === 'PAID').length;
      const outstandingInvoiceCount = currentInvoices.filter((inv) =>
        ['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status)
      ).length;
      const overdueInvoiceCount = currentInvoices.filter((inv) => inv.status === 'OVERDUE').length;

      // Calculate previous KPIs for growth comparison
      const prevRevenue = prevPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const revenueGrowthPercent =
        prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

      const kpis: FinancialKpis = {
        totalRevenue,
        totalInvoiced,
        outstandingBalance,
        collectionRate,
        averageInvoiceValue,
        invoiceCount,
        paidInvoiceCount,
        outstandingInvoiceCount,
        overdueInvoiceCount,
        revenueGrowthPercent,
      };

      // Compute Payment Method Breakdown
      const methodCounts = new Map<string, { count: number; amount: number }>();
      let totalPaymentSum = 0;
      for (const p of currentPayments) {
        const method = p.payment_method || 'CASH';
        const current = methodCounts.get(method) || { count: 0, amount: 0 };
        methodCounts.set(method, {
          count: current.count + 1,
          amount: current.amount + Number(p.amount),
        });
        totalPaymentSum += Number(p.amount);
      }

      const paymentBreakdown: PaymentMethodBreakdown[] = Array.from(methodCounts.entries()).map(
        ([method, stats]) => ({
          method,
          count: stats.count,
          amount: stats.amount,
          percentage: totalPaymentSum > 0 ? (stats.amount / totalPaymentSum) * 100 : 0,
        })
      );

      // Compute Invoice Status Breakdown
      const statusCounts = new Map<string, number>();
      for (const inv of currentInvoices) {
        statusCounts.set(inv.status, (statusCounts.get(inv.status) || 0) + 1);
      }

      const invoiceBreakdown: InvoiceStatusBreakdown[] = Array.from(statusCounts.entries()).map(
        ([status, count]) => ({
          status,
          count,
          percentage: invoiceCount > 0 ? (count / invoiceCount) * 100 : 0,
        })
      );

      // Group monthly trend for the last 12 months
      // Fetch invoices and payments for the last 12 months to generate trend rows
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
      twelveMonthsAgo.setDate(1);
      twelveMonthsAgo.setHours(0, 0, 0, 0);

      const trendInvoicesRes = await this.repo.getInvoices(workspaceId, twelveMonthsAgo, end);
      const trendPaymentsRes = await this.repo.getPayments(workspaceId, twelveMonthsAgo, end);

      const trendInvoices = trendInvoicesRes.data || [];
      const trendPayments = trendPaymentsRes.data || [];

      // Extract unique invoice IDs for trend invoices to compute true outstanding values
      const trendInvoiceIds = trendInvoices.map((inv) => inv.id);
      let trendLifetimePayments: RawPaymentRow[] = [];
      if (trendInvoiceIds.length > 0) {
        const trendLifetimePaymentsRes = await this.repo.getPayments(workspaceId);
        trendLifetimePayments = (trendLifetimePaymentsRes.data || []).filter(
          (p) => p.invoice_id && trendInvoiceIds.includes(p.invoice_id)
        );
      }

      const trendLifetimePaidSums = new Map<string, number>();
      for (const pay of trendLifetimePayments) {
        const currentSum = trendLifetimePaidSums.get(pay.invoice_id) || 0;
        trendLifetimePaidSums.set(pay.invoice_id, currentSum + Number(pay.amount));
      }

      const getTrendInvoiceOutstanding = (inv: RawInvoiceRow) => {
        if (inv.status === 'CANCELLED') return 0;
        const paidAmount = trendLifetimePaidSums.get(inv.id) || 0;
        return Math.max(0, Number(inv.total_amount) - paidAmount);
      };

      const monthlyTrendMap = new Map<string, MonthlySummaryRow>();

      // Initialize last 12 months in sorted order
      for (let i = 0; i < 12; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - 11 + i);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyTrendMap.set(monthKey, {
          month: monthKey,
          invoiced: 0,
          collected: 0,
          outstanding: 0,
          tax: 0,
          averageInvoice: 0,
          collectionRate: 0,
          invoiceCount: 0,
        });
      }

      // Populate trend invoices
      for (const inv of trendInvoices) {
        const date = new Date(inv.issue_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const row = monthlyTrendMap.get(monthKey);
        if (row) {
          row.invoiced += Number(inv.total_amount);
          row.outstanding += getTrendInvoiceOutstanding(inv);
          row.tax += Number(inv.tax_amount);
          row.invoiceCount += 1;
        }
      }

      // Populate trend payments
      for (const p of trendPayments) {
        const date = new Date(p.payment_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const row = monthlyTrendMap.get(monthKey);
        if (row) {
          row.collected += Number(p.amount);
        }
      }

      // Finalize averages and collection rates for each month
      const monthlyTrend = Array.from(monthlyTrendMap.values()).map((row) => {
        row.averageInvoice = row.invoiceCount > 0 ? row.invoiced / row.invoiceCount : 0;
        row.collectionRate = row.invoiced > 0 ? (row.collected / row.invoiced) * 100 : 0;
        return row;
      });

      // Top 10 Customers Calculation
      // Group invoices and payments by customer in current period
      const customerStats = new Map<
        string,
        {
          name: string;
          revenue: number;
          invoicedTotal: number;
          invoiceCount: number;
          outstanding: number;
          lastPaymentDate: string | null;
        }
      >();

      for (const inv of currentInvoices) {
        const cid = inv.customer_id;
        const name = inv.customers?.full_name || 'Walk-in / Guest';
        const stats = customerStats.get(cid) || {
          name,
          revenue: 0,
          invoicedTotal: 0,
          invoiceCount: 0,
          outstanding: 0,
          lastPaymentDate: null,
        };

        stats.invoicedTotal += Number(inv.total_amount);
        stats.invoiceCount += 1;
        stats.outstanding += getInvoiceOutstanding(inv);
        customerStats.set(cid, stats);
      }

      for (const p of currentPayments) {
        const cid = p.invoices?.customer_id;
        if (!cid) continue;
        const name = p.invoices?.customers?.full_name || 'Walk-in / Guest';
        const stats = customerStats.get(cid) || {
          name,
          revenue: 0,
          invoicedTotal: 0,
          invoiceCount: 0,
          outstanding: 0,
          lastPaymentDate: null,
        };

        stats.revenue += Number(p.amount);
        const pDate = p.payment_date;
        if (!stats.lastPaymentDate || new Date(pDate) > new Date(stats.lastPaymentDate)) {
          stats.lastPaymentDate = pDate;
        }
        customerStats.set(cid, stats);
      }

      const topCustomers: TopCustomerRow[] = Array.from(customerStats.entries())
        .map(([customerId, stats]) => ({
          customerId,
          customerName: stats.name,
          revenue: stats.revenue,
          outstanding: stats.outstanding,
          invoiceCount: stats.invoiceCount,
          averageInvoice: stats.invoiceCount > 0 ? stats.invoicedTotal / stats.invoiceCount : 0,
          lastPaymentDate: stats.lastPaymentDate,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Business Insights Engine (Deterministic Calculations)
      const insights: BusinessInsight[] = [];

      // Revenue Insight
      if (revenueGrowthPercent > 0) {
        insights.push({
          type: 'success',
          text: `Revenue increased by ${revenueGrowthPercent.toFixed(
            1
          )}% compared to the previous period.`,
        });
      } else if (revenueGrowthPercent < 0) {
        insights.push({
          type: 'danger',
          text: `Revenue dropped by ${Math.abs(revenueGrowthPercent).toFixed(
            1
          )}% compared to the previous period.`,
        });
      }

      // Collection Rate Insight
      if (collectionRate >= 85) {
        insights.push({
          type: 'success',
          text: `Payment collection rate is very high at ${collectionRate.toFixed(
            1
          )}%. Outstanding exposure is low.`,
        });
      } else if (collectionRate > 0 && collectionRate < 60) {
        insights.push({
          type: 'warning',
          text: `Collection rate is low at ${collectionRate.toFixed(
            1
          )}%. Consider enforcing deposits or stricter payment terms.`,
        });
      }

      // Outstanding Invoices Insight
      if (outstandingBalance > 0) {
        insights.push({
          type: 'warning',
          text: `There is $${outstandingBalance.toFixed(
            2
          )} in outstanding invoices for this period. Keep an eye on accounts receivable.`,
        });
      }

      // Overdue Invoices Insight
      if (overdueInvoiceCount > 0) {
        insights.push({
          type: 'danger',
          text: `You have ${overdueInvoiceCount} overdue invoices. Consider sending polite payment reminders.`,
        });
      }

      // Concentration Risk Insight (Top Customer)
      if (topCustomers.length > 0 && totalRevenue > 0) {
        const topCustomer = topCustomers[0];
        const percent = (topCustomer.revenue / totalRevenue) * 100;
        if (percent >= 15) {
          insights.push({
            type: 'info',
            text: `Top customer "${topCustomer.customerName}" generated ${percent.toFixed(
              1
            )}% of this period's total revenue ($${topCustomer.revenue.toFixed(2)}).`,
          });
        }
      }

      // Fallback if no specific insights generated
      if (insights.length === 0) {
        insights.push({
          type: 'info',
          text: 'Metrics are steady. Continue monitoring payments and invoicing history.',
        });
      }

      const currency = currentInvoices[0]?.currency || 'USD';

      return ok({
        kpis,
        monthlyTrend,
        paymentBreakdown,
        invoiceBreakdown,
        topCustomers,
        insights,
        currency,
      });
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }
}
