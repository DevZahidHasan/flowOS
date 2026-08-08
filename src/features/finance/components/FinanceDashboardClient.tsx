'use client';

import { useState, useTransition, useEffect } from 'react';
import { Expense, FinancialReportData, FinanceFilters, FinanceDateRange } from '../types';
import { ExpenseList } from './ExpenseList';
import { ExpenseFormSheet } from './ExpenseFormSheet';
import { FinancialEmptyState } from './FinancialEmptyState';
import { ExpenseSkeleton } from './ExpenseSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Search, Wallet, TrendingUp, TrendingDown, 
  Landmark, AlertTriangle, Sparkles, Calendar, ArrowRight 
} from 'lucide-react';

import { getFinancialReportAction } from '../actions/finance.actions';

interface Props {
  workspaceId: string;
  initialReportData: FinancialReportData;
}

export function FinanceDashboardClient({ workspaceId, initialReportData }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [reportData, setReportData] = useState<FinancialReportData>(initialReportData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    setReportData(initialReportData);
  }, [initialReportData]);

  // Filters state
  const [range, setRange] = useState<FinanceDateRange>('THIS_MONTH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Expenses sub-filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedExpense(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedExpense(null);
  };

  const applyFilters = (newRange: FinanceDateRange, start?: string, end?: string) => {
    startTransition(async () => {
      const filters: FinanceFilters = {
        range: newRange,
        startDate: start || undefined,
        endDate: end || undefined,
      };

      const res = await getFinancialReportAction(workspaceId, filters);
      if (res.error) {
        toast({
          title: 'Failed to load report data',
          description: res.error.message,
          variant: 'destructive',
        });
      } else if (res.data) {
        setReportData(res.data);
      }
    });
  };

  const handleRangeChange = (value: FinanceDateRange) => {
    setRange(value);
    if (value !== 'CUSTOM') {
      applyFilters(value);
    }
  };

  const handleCustomDateSubmit = () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Missing dates',
        description: 'Please select both start and end dates.',
        variant: 'destructive',
      });
      return;
    }
    applyFilters('CUSTOM', startDate, endDate);
  };

  const filteredExpenses = reportData.expenses.filter((expense) => {
    const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (expense.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const kpi = reportData.kpis;

  // Custom SVG Chart rendering helpers
  const chartData = reportData.charts.revenueVsExpenses;
  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.revenue, d.expenses)),
    100 // Prevent division by zero / tiny chart
  );

  return (
    <div className="space-y-6">
      {/* Filters header card */}
      <div className="p-4 bg-card/25 backdrop-blur-md border border-border/40 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Reporting Period</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Select value={range} onValueChange={handleRangeChange} disabled={isPending}>
            <SelectTrigger className="w-[160px] bg-background/50 border-border/40 min-h-[40px]">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/40">
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="THIS_WEEK">This Week</SelectItem>
              <SelectItem value="THIS_MONTH">This Month</SelectItem>
              <SelectItem value="LAST_MONTH">Last Month</SelectItem>
              <SelectItem value="LAST_30_DAYS">Last 30 Days</SelectItem>
              <SelectItem value="THIS_QUARTER">This Quarter</SelectItem>
              <SelectItem value="THIS_YEAR">This Year</SelectItem>
              <SelectItem value="CUSTOM">Custom Date...</SelectItem>
            </SelectContent>
          </Select>

          {range === 'CUSTOM' && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right duration-200">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[140px] bg-background/50 border-border/40 min-h-[40px]"
                disabled={isPending}
              />
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[140px] bg-background/50 border-border/40 min-h-[40px]"
                disabled={isPending}
              />
              <Button onClick={handleCustomDateSubmit} disabled={isPending} size="sm" className="min-h-[40px]">
                Apply
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] bg-muted/30 border border-border/40 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-lg text-sm">
            Expenses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {isPending ? (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-card/10 border border-border/20 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            /* KPIs Grid */
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <div className="p-4 bg-card/25 backdrop-blur-md border border-border/40 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Total Revenue</span>
                  <Landmark className="h-4 w-4 text-primary" />
                </div>
                <div className="text-xl font-bold text-foreground">
                  ${kpi.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-muted-foreground">From paid invoice payments</p>
              </div>

              <div className="p-4 bg-card/25 backdrop-blur-md border border-border/40 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Total Expenses</span>
                  <TrendingDown className="h-4 w-4 text-destructive" />
                </div>
                <div className="text-xl font-bold text-foreground">
                  -${kpi.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-muted-foreground">Logged operational costs</p>
              </div>

              <div className="p-4 bg-card/25 backdrop-blur-md border border-border/40 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Net Profit</span>
                  <TrendingUp className={`h-4 w-4 ${kpi.netProfit >= 0 ? 'text-green-400' : 'text-destructive'}`} />
                </div>
                <div className={`text-xl font-bold ${kpi.netProfit >= 0 ? 'text-green-400' : 'text-destructive'}`}>
                  {kpi.netProfit >= 0 ? '' : '-'}${Math.abs(kpi.netProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-muted-foreground">Revenue minus expenses</p>
              </div>

              <div className="p-4 bg-card/25 backdrop-blur-md border border-border/40 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Profit Margin</span>
                  <Wallet className="h-4 w-4 text-yellow-400" />
                </div>
                <div className="text-xl font-bold text-foreground">
                  {kpi.profitMargin.toFixed(1)}%
                </div>
                <p className="text-[10px] text-muted-foreground">Business efficiency ratio</p>
              </div>
            </div>
          )}

          {/* Health insights, receivables */}
          {reportData.healthInsights.length > 0 && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Business Health Insights</h4>
              </div>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1.5 pl-1 leading-relaxed">
                {reportData.healthInsights.map((insight, idx) => (
                  <li key={idx} className="marker:text-primary/70">{insight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SVG Trend Chart */}
          <div className="p-5 bg-card/20 backdrop-blur-md border border-border/40 rounded-2xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Cash Flow Trend</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Comparison of revenue inflow and expense outflow over the selected period.</p>
            </div>

            {chartData.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center border border-dashed border-border/30 rounded-xl">
                <span className="text-xs text-muted-foreground">Insufficient period transaction data to render trend line.</span>
              </div>
            ) : (
              <div className="relative w-full h-[180px] pt-4 select-none">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="0" x2="500" y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

                  {/* Revenue Line */}
                  <path
                    d={chartData.map((d, i) => {
                      const x = (i / (chartData.length - 1)) * 500;
                      const y = 100 - (d.revenue / maxVal) * 100;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Expenses Line */}
                  <path
                    d={chartData.map((d, i) => {
                      const x = (i / (chartData.length - 1)) * 500;
                      const y = 100 - (d.expenses / maxVal) * 100;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="rgb(239, 68, 68)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Legends */}
                <div className="absolute top-2 right-2 flex items-center gap-3 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">Expenses</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Receivables Alert */}
          {kpi.outstandingReceivables > 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-500">Uncollected Receivables Warning</h4>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  Your business has <strong className="text-foreground">${kpi.outstandingReceivables.toLocaleString()}</strong> in outstanding customer invoices that are in Sent or Partially Paid status. Follow up with these clients to secure your cash flow.
                </p>
              </div>
            </div>
          )}

          {/* Financial Breakdown Lists */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue Breakdown */}
            <div className="p-5 bg-card/20 backdrop-blur-md border border-border/40 rounded-2xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Revenue by Customer</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Top billing client accounts generating business sales volume.</p>
              </div>

              {reportData.revenueBreakdown.byCustomer.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">No customer billing transactions recorded.</div>
              ) : (
                <div className="space-y-3">
                  {reportData.revenueBreakdown.byCustomer.map((customer, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-foreground">{customer.customerName}</span>
                        <span className="text-muted-foreground">${customer.amount.toLocaleString()} ({customer.percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted/30 border border-border/20 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500/80 rounded-full" style={{ width: `${customer.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service & Catalog Breakdown */}
            <div className="p-5 bg-card/20 backdrop-blur-md border border-border/40 rounded-2xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Revenue by Service</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Distribution of revenue generated across catalog services.</p>
              </div>

              {reportData.revenueBreakdown.byService.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">No service appointment completions recorded.</div>
              ) : (
                <div className="space-y-3">
                  {reportData.revenueBreakdown.byService.map((service, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-foreground">{service.serviceName}</span>
                        <span className="text-muted-foreground">${service.amount.toLocaleString()} ({service.percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted/30 border border-border/20 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500/80 rounded-full" style={{ width: `${service.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expense breakdown by category */}
            <div className="p-5 bg-card/20 backdrop-blur-md border border-border/40 rounded-2xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Expenses by Category</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Breakdown of operational spend across expense tags.</p>
              </div>

              {reportData.expenseBreakdown.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">No operational costs recorded.</div>
              ) : (
                <div className="space-y-3">
                  {reportData.expenseBreakdown.map((expense, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-foreground">{expense.category}</span>
                        <span className="text-muted-foreground">${expense.amount.toLocaleString()} ({expense.percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted/30 border border-border/20 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500/80 rounded-full" style={{ width: `${expense.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Staff Revenue Contribution */}
            <div className="p-5 bg-card/20 backdrop-blur-md border border-border/40 rounded-2xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Revenue by Staff Member</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Sales contribution matching staff directory commissions.</p>
              </div>

              {reportData.revenueBreakdown.byStaff.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">No staff-associated transactions recorded.</div>
              ) : (
                <div className="space-y-3">
                  {reportData.revenueBreakdown.byStaff.map((staff, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-foreground">{staff.staffName}</span>
                        <span className="text-muted-foreground">${staff.amount.toLocaleString()} ({staff.percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted/30 border border-border/20 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500/80 rounded-full" style={{ width: `${staff.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-[260px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 min-h-[40px] bg-background/50 border-border/40"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] min-h-[40px] bg-background/50 border-border/40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/40">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Salaries">Salaries</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Supplies">Supplies</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Taxes">Taxes</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleCreate} className="w-full sm:w-auto min-h-[44px]">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>

          {isPending ? (
            <ExpenseSkeleton />
          ) : reportData.expenses.length === 0 ? (
            <FinancialEmptyState onAddExpense={handleCreate} />
          ) : filteredExpenses.length === 0 ? (
            <div className="p-8 text-center bg-card/25 backdrop-blur-md border border-border/40 rounded-2xl">
              <p className="text-sm text-muted-foreground">No expenses match your search filters.</p>
            </div>
          ) : (
            <ExpenseList
              workspaceId={workspaceId}
              expenses={filteredExpenses}
              onEdit={handleEdit}
            />
          )}
        </TabsContent>
      </Tabs>

      <ExpenseFormSheet
        workspaceId={workspaceId}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        expense={selectedExpense}
      />
    </div>
  );
}
