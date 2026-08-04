'use client';

import { useState, useTransition } from 'react';
import { DateRangeFilterType, FinancialReportData } from '../types';
import { getFinancialReportAction } from '../actions/reports.actions';
import { FinancialKpisCards } from './FinancialKpis';
import { FinancialCharts } from './FinancialCharts';
import { TopCustomersAndPaymentMethods } from './TopCustomersAndPaymentMethods';
import { MonthlyReportsTable } from './MonthlyReportsTable';
import { BusinessInsights } from './BusinessInsights';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  workspaceId: string;
  initialData: FinancialReportData;
}

export function ReportsDashboard({ workspaceId, initialData }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<FinancialReportData>(initialData);

  // Filters State
  const [filterType, setFilterType] = useState<DateRangeFilterType>('LAST_30_DAYS');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const fetchUpdatedReport = (type: DateRangeFilterType, startD?: string, endD?: string) => {
    startTransition(async () => {
      const res = await getFinancialReportAction(workspaceId, type, startD, endD);
      if (res.error) {
        toast({
          title: 'Update failed',
          description: res.error.message,
          variant: 'destructive',
        });
      } else if (res.data) {
        setData(res.data);
      }
    });
  };

  const handleFilterChange = (val: DateRangeFilterType) => {
    setFilterType(val);
    if (val !== 'CUSTOM') {
      fetchUpdatedReport(val);
    }
  };

  const handleCustomDateChange = (startStr: string, endStr: string) => {
    setCustomStart(startStr);
    setCustomEnd(endStr);
    if (startStr && endStr) {
      fetchUpdatedReport('CUSTOM', startStr, endStr);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur border border-white/5 p-4 rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Financial Dashboard</h2>
          <p className="text-xs text-slate-400">
            Real-time revenue, collections, outstanding invoicing, and growth indexes.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {/* Preset Selector */}
          <div className="space-y-1">
            <Label htmlFor="date-preset" className="text-[10px] uppercase text-slate-500 tracking-wider">
              Date Period
            </Label>
            <Select value={filterType} onValueChange={(v) => handleFilterChange(v as DateRangeFilterType)}>
              <SelectTrigger id="date-preset" className="w-[180px] h-9 bg-slate-950 border-white/10 text-white text-xs rounded-xl focus:ring-0">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-white/10 text-white rounded-xl">
                <SelectItem value="TODAY">Today</SelectItem>
                <SelectItem value="THIS_WEEK">This Week</SelectItem>
                <SelectItem value="LAST_7_DAYS">Last 7 Days</SelectItem>
                <SelectItem value="THIS_MONTH">This Month</SelectItem>
                <SelectItem value="LAST_30_DAYS">Last 30 Days</SelectItem>
                <SelectItem value="THIS_QUARTER">This Quarter</SelectItem>
                <SelectItem value="THIS_YEAR">This Year</SelectItem>
                <SelectItem value="CUSTOM">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Ranges */}
          {filterType === 'CUSTOM' && (
            <>
              <div className="space-y-1">
                <Label htmlFor="start-date" className="text-[10px] uppercase text-slate-500 tracking-wider">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStart}
                  onChange={(e) => handleCustomDateChange(e.target.value, customEnd)}
                  className="h-9 bg-slate-950 border-white/10 text-white text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end-date" className="text-[10px] uppercase text-slate-500 tracking-wider">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEnd}
                  onChange={(e) => handleCustomDateChange(customStart, e.target.value)}
                  className="h-9 bg-slate-950 border-white/10 text-white text-xs rounded-xl"
                />
              </div>
            </>
          )}

          {isPending && (
            <div className="h-9 flex items-center justify-center pl-2 text-xs text-indigo-400 font-medium">
              <span className="animate-pulse">Syncing...</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <FinancialKpisCards kpis={data.kpis} currency={data.currency} />

      {/* Business Insights Panel */}
      <BusinessInsights insights={data.insights} />

      {/* SVG Charts section */}
      <FinancialCharts
        monthlyTrend={data.monthlyTrend}
        paymentBreakdown={data.paymentBreakdown}
        invoiceBreakdown={data.invoiceBreakdown}
        currency={data.currency}
      />

      {/* Top Customers & Payment Breakdown tables */}
      <TopCustomersAndPaymentMethods
        topCustomers={data.topCustomers}
        paymentBreakdown={data.paymentBreakdown}
        currency={data.currency}
      />

      {/* Monthly Performance Table */}
      <MonthlyReportsTable monthlyTrend={data.monthlyTrend} currency={data.currency} />
    </div>
  );
}
