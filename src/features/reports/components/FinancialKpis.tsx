'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialKpis } from '../types';

interface Props {
  kpis: FinancialKpis;
  currency: string;
}

export function FinancialKpisCards({ kpis, currency }: Props) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(val);
  };

  const getGrowthIndicator = (pct: number) => {
    if (pct > 0) {
      return (
        <span className="inline-flex items-center text-xs font-semibold text-emerald-400">
          ▲ +{pct.toFixed(1)}% vs. prev
        </span>
      );
    }
    if (pct < 0) {
      return (
        <span className="inline-flex items-center text-xs font-semibold text-rose-400">
          ▼ {pct.toFixed(1)}% vs. prev
        </span>
      );
    }
    return <span className="text-xs text-slate-500">No change vs. prev</span>;
  };

  const collectionRateColor = (rate: number) => {
    if (rate >= 85) return 'text-emerald-400';
    if (rate >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {/* Total Revenue / Collected */}
      <Card className="bg-card text-card-foreground border hover:border-emerald-500/20 transition-all duration-150">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-slate-400">Total Collected</CardTitle>
          <span className="text-sm">💰</span>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-emerald-400">
            {formatCurrency(kpis.totalRevenue)}
          </div>
          <div className="mt-1 flex items-center space-x-1">
            {getGrowthIndicator(kpis.revenueGrowthPercent)}
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Balance */}
      <Card className="bg-card text-card-foreground border hover:border-rose-500/20 transition-all duration-150">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-slate-400">Outstanding Balance</CardTitle>
          <span className="text-sm">⏳</span>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-rose-400">
            {formatCurrency(kpis.outstandingBalance)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {kpis.overdueInvoiceCount} overdue invoices
          </p>
        </CardContent>
      </Card>

      {/* Total Invoiced */}
      <Card className="bg-card text-card-foreground border hover:border-blue-500/20 transition-all duration-150">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-slate-400">Total Invoiced</CardTitle>
          <span className="text-sm">📄</span>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-blue-400">
            {formatCurrency(kpis.totalInvoiced)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Across {kpis.invoiceCount} total invoices
          </p>
        </CardContent>
      </Card>

      {/* Collection Rate */}
      <Card className="bg-card text-card-foreground border hover:border-purple-500/20 transition-all duration-150">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-slate-400">Collection Rate</CardTitle>
          <span className="text-sm">📈</span>
        </CardHeader>
        <CardContent>
          <div className={`text-xl md:text-2xl font-bold ${collectionRateColor(kpis.collectionRate)}`}>
            {kpis.collectionRate.toFixed(1)}%
          </div>
          <div className="mt-1 flex space-x-2 text-[10px] text-slate-400">
            <span>🟢 {kpis.paidInvoiceCount} Paid</span>
            <span>🟡 {kpis.outstandingInvoiceCount} Unpaid</span>
          </div>
        </CardContent>
      </Card>

      {/* Average Invoice Value (Extra KPI card) */}
      <Card className="col-span-2 bg-card text-card-foreground border hover:border-indigo-500/20 transition-all duration-150">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Average Invoice Value</p>
            <div className="text-lg md:text-xl font-bold text-indigo-400 mt-1">
              {formatCurrency(kpis.averageInvoiceValue)}
            </div>
          </div>
          <div className="text-right border-l border-white/5 pl-4 flex-1 ml-4 flex justify-around">
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Paid Invoices</p>
              <p className="text-sm font-semibold text-emerald-400">{kpis.paidInvoiceCount}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Unpaid Invoices</p>
              <p className="text-sm font-semibold text-amber-400">{kpis.outstandingInvoiceCount}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Overdue</p>
              <p className="text-sm font-semibold text-rose-500">{kpis.overdueInvoiceCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
