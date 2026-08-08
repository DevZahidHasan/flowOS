import { z } from 'zod';

export type ExpenseCategory =
  | 'Rent'
  | 'Utilities'
  | 'Salaries'
  | 'Marketing'
  | 'Supplies'
  | 'Equipment'
  | 'Software'
  | 'Transportation'
  | 'Taxes'
  | 'Maintenance'
  | 'Other';

export type PaymentMethod =
  | 'Cash'
  | 'Card'
  | 'Bank Transfer'
  | 'Check'
  | 'Other';

export interface Expense {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  isRecurring: boolean;
  recurrencePeriod: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export const createExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().optional().nullable(),
  amount: z.number().positive('Amount must be positive'),
  category: z.enum([
    'Rent', 'Utilities', 'Salaries', 'Marketing', 'Supplies',
    'Equipment', 'Software', 'Transportation', 'Taxes', 'Maintenance', 'Other'
  ]),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  paymentMethod: z.enum(['Cash', 'Card', 'Bank Transfer', 'Check', 'Other']),
  isRecurring: z.boolean().default(false),
  recurrencePeriod: z.enum(['Weekly', 'Monthly', 'Yearly']).optional().nullable(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema.partial();
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export type FinanceDateRange =
  | 'TODAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'LAST_30_DAYS'
  | 'THIS_QUARTER'
  | 'THIS_YEAR'
  | 'CUSTOM';

export interface FinanceFilters {
  range: FinanceDateRange;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  category?: ExpenseCategory;
}

export interface FinancialKPIs {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  outstandingReceivables: number;
  averageRevenue: number;
  previousPeriodCompare?: {
    revenueDiffPercent: number;
    expensesDiffPercent: number;
    profitDiffPercent: number;
  };
}

export interface ServiceRevenueBreakdown {
  serviceName: string;
  amount: number;
  percentage: number;
}

export interface CustomerRevenueBreakdown {
  customerName: string;
  amount: number;
  percentage: number;
}

export interface StaffRevenueBreakdown {
  staffName: string;
  amount: number;
  percentage: number;
}

export interface PaymentMethodRevenueBreakdown {
  paymentMethod: string;
  amount: number;
  percentage: number;
}

export interface ExpenseCategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export interface FinancialReportData {
  kpis: FinancialKPIs;
  expenses: Expense[];
  revenueBreakdown: {
    byService: ServiceRevenueBreakdown[];
    byCustomer: CustomerRevenueBreakdown[];
    byStaff: StaffRevenueBreakdown[];
    byPaymentMethod: PaymentMethodRevenueBreakdown[];
  };
  expenseBreakdown: ExpenseCategoryBreakdown[];
  charts: {
    revenueVsExpenses: {
      date: string;
      revenue: number;
      expenses: number;
    }[];
    profitTrend: {
      date: string;
      profit: number;
    }[];
  };
  healthInsights: string[];
}
