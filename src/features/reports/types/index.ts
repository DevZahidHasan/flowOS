import { z } from 'zod';

export type DateRangeFilterType =
  | 'TODAY'
  | 'THIS_WEEK'
  | 'LAST_7_DAYS'
  | 'THIS_MONTH'
  | 'LAST_30_DAYS'
  | 'THIS_QUARTER'
  | 'THIS_YEAR'
  | 'CUSTOM';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface FinancialKpis {
  totalRevenue: number;         // Payments received in range
  totalInvoiced: number;        // Invoices issued in range
  outstandingBalance: number;   // Invoices unpaid balance in range
  collectionRate: number;       // (Total Revenue / Total Invoiced) * 100
  averageInvoiceValue: number;  // Total Invoiced / Total Invoices
  invoiceCount: number;
  paidInvoiceCount: number;
  outstandingInvoiceCount: number;
  overdueInvoiceCount: number;
  revenueGrowthPercent: number; // growth compared to previous period of same duration
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface InvoiceStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface MonthlySummaryRow {
  month: string;                // YYYY-MM
  invoiced: number;
  collected: number;
  outstanding: number;
  tax: number;
  averageInvoice: number;
  collectionRate: number;
  invoiceCount: number;
}

export interface TopCustomerRow {
  customerId: string;
  customerName: string;
  revenue: number;
  outstanding: number;
  invoiceCount: number;
  averageInvoice: number;
  lastPaymentDate: string | null;
}

export interface BusinessInsight {
  type: 'success' | 'warning' | 'info' | 'danger';
  text: string;
}

export interface FinancialReportData {
  kpis: FinancialKpis;
  monthlyTrend: MonthlySummaryRow[];
  paymentBreakdown: PaymentMethodBreakdown[];
  invoiceBreakdown: InvoiceStatusBreakdown[];
  topCustomers: TopCustomerRow[];
  insights: BusinessInsight[];
  currency: string;
}

// Validation schemas for actions
export const reportsFilterSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  filterType: z.enum([
    'TODAY',
    'THIS_WEEK',
    'LAST_7_DAYS',
    'THIS_MONTH',
    'LAST_30_DAYS',
    'THIS_QUARTER',
    'THIS_YEAR',
    'CUSTOM',
  ] as const),
  customStartDate: z.string().optional(),
  customEndDate: z.string().optional(),
});

export type ReportsFilterInput = z.infer<typeof reportsFilterSchema>;
