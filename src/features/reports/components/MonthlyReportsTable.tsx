'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MonthlySummaryRow } from '../types';

interface Props {
  monthlyTrend: MonthlySummaryRow[];
  currency: string;
}

export function MonthlyReportsTable({ monthlyTrend, currency }: Props) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(val);
  };

  const handleExportCSV = () => {
    const headers = [
      'Month',
      'Invoiced Amount',
      'Collected Amount',
      'Outstanding Balance',
      'Tax Amount',
      'Average Invoice Value',
      'Collection Rate (%)',
      'Invoice Count',
    ];

    const csvRows = monthlyTrend.map((row) => [
      row.month,
      row.invoiced.toFixed(2),
      row.collected.toFixed(2),
      row.outstanding.toFixed(2),
      row.tax.toFixed(2),
      row.averageInvoice.toFixed(2),
      row.collectionRate.toFixed(1),
      row.invoiceCount,
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map((e) => e.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `monthly_financial_report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sort monthly trend descending (latest month first) for reporting view
  const displayRows = [...monthlyTrend].reverse();

  return (
    <Card className="bg-slate-900 border-white/5">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-white">Monthly Performance Ledger</CardTitle>
        <Button onClick={handleExportCSV} variant="secondary" size="sm" className="h-8">
          📤 Export CSV
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        {displayRows.length === 0 ? (
          <div className="text-center text-xs text-slate-500 py-8">No historical data found.</div>
        ) : (
          <Table className="min-w-[800px] xl:min-w-0">
            <TableHeader>
              <TableRow className="border-white/5">
                <TableHead className="text-slate-400">Month</TableHead>
                <TableHead className="text-slate-400">Invoices</TableHead>
                <TableHead className="text-slate-400">Invoiced</TableHead>
                <TableHead className="text-slate-400">Collected</TableHead>
                <TableHead className="text-slate-400">Outstanding</TableHead>
                <TableHead className="text-slate-400">Tax</TableHead>
                <TableHead className="text-slate-400">Avg Invoice</TableHead>
                <TableHead className="text-right text-slate-400">Collection %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.map((row) => (
                <TableRow key={row.month} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-semibold text-white">
                    {(() => {
                      const [year, month] = row.month.split('-');
                      const date = new Date(Number(year), Number(month) - 1, 1);
                      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    })()}
                  </TableCell>
                  <TableCell className="text-slate-300">{row.invoiceCount}</TableCell>
                  <TableCell className="text-blue-400">{formatCurrency(row.invoiced)}</TableCell>
                  <TableCell className="text-emerald-400">{formatCurrency(row.collected)}</TableCell>
                  <TableCell className={row.outstanding > 0 ? 'text-rose-400' : 'text-slate-500'}>
                    {formatCurrency(row.outstanding)}
                  </TableCell>
                  <TableCell className="text-slate-300">{formatCurrency(row.tax)}</TableCell>
                  <TableCell className="text-slate-300">{formatCurrency(row.averageInvoice)}</TableCell>
                  <TableCell className="text-right font-bold">
                    <span
                      className={
                        row.collectionRate >= 85
                          ? 'text-emerald-400'
                          : row.collectionRate >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }
                    >
                      {row.collectionRate.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
