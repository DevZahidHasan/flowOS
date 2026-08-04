'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlySummaryRow, PaymentMethodBreakdown, InvoiceStatusBreakdown } from '../types';

interface Props {
  monthlyTrend: MonthlySummaryRow[];
  paymentBreakdown: PaymentMethodBreakdown[];
  invoiceBreakdown: InvoiceStatusBreakdown[];
  currency: string;
}

export function FinancialCharts({ monthlyTrend, paymentBreakdown, invoiceBreakdown, currency }: Props) {
  const [hoveredTrend, setHoveredTrend] = useState<MonthlySummaryRow | null>(null);
  const [hoveredPayment, setHoveredPayment] = useState<PaymentMethodBreakdown | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // --- TREND CHART LOGIC (SVG) ---
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const svgWidth = 600;
  const svgHeight = 280;
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Find max value in monthly trend for Y scale
  const maxTrendVal = Math.max(
    ...monthlyTrend.map((row) => Math.max(row.invoiced, row.collected)),
    1000 // default minimum peak
  );

  // Grid divisions
  const yTicks = 4;
  const xCount = monthlyTrend.length;

  const getYCoordinate = (val: number) => {
    return chartHeight + padding.top - (val / maxTrendVal) * chartHeight;
  };

  const getXCoordinate = (index: number) => {
    if (xCount <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (xCount - 1)) * chartWidth;
  };

  // Format month name (e.g. YYYY-MM -> MMM YY)
  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  // SVG Line path helper
  const getLinePath = (dataKey: 'invoiced' | 'collected') => {
    if (xCount === 0) return '';
    return monthlyTrend
      .map((row, idx) => {
        const x = getXCoordinate(idx);
        const y = getYCoordinate(row[dataKey]);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const getAreaPath = (dataKey: 'invoiced' | 'collected') => {
    if (xCount === 0) return '';
    const linePath = getLinePath(dataKey);
    const firstX = getXCoordinate(0);
    const lastX = getXCoordinate(xCount - 1);
    const zeroY = chartHeight + padding.top;
    return `${linePath} L ${lastX} ${zeroY} L ${firstX} ${zeroY} Z`;
  };

  // --- DONUT CHART LOGIC (SVG) ---
  const donutRadius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * donutRadius; // ~314.16

  // Distinct colors for payment methods
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'CASH':
        return '#10B981'; // emerald-500
      case 'CARD':
        return '#3B82F6'; // blue-500
      case 'BANK_TRANSFER':
        return '#8B5CF6'; // purple-500
      case 'MOBILE_BANKING':
        return '#EC4899'; // pink-500
      case 'CHEQUE':
        return '#F59E0B'; // amber-500
      default:
        return '#64748B'; // slate-500
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'bg-emerald-500';
      case 'PARTIALLY_PAID':
        return 'bg-purple-500';
      case 'SENT':
        return 'bg-blue-500';
      case 'OVERDUE':
        return 'bg-rose-500';
      case 'DRAFT':
        return 'bg-slate-500';
      default:
        return 'bg-amber-500';
    }
  };

  // Calculate Dash Offsets for Donut Chart
  let accumulatedPercent = 0;
  const donutSlices = paymentBreakdown
    .filter((p) => p.amount > 0)
    .map((p) => {
      const offset = circumference - (p.percentage / 100) * circumference;
      const rotation = (accumulatedPercent / 100) * 360 - 90;
      accumulatedPercent += p.percentage;
      return {
        ...p,
        offset,
        rotation,
      };
    });

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      {/* Revenue & Invoices Trend (Line / Area Chart) */}
      <Card className="lg:col-span-2 bg-slate-900 border-white/5 flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-white">Revenue & Invoicing Trend</CardTitle>
          <div className="flex space-x-3 text-xs">
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
              <span className="text-slate-400">Invoiced</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-400">Collected</span>
            </span>
          </div>
        </CardHeader>
        <CardContent className="relative flex-1 flex flex-col justify-center">
          {/* Tooltip Overlay */}
          {hoveredTrend && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950 border border-white/10 rounded-lg p-2 text-xs shadow-xl z-10 flex space-x-4 animate-in fade-in zoom-in-95 duration-100">
              <div>
                <p className="text-slate-500 uppercase text-[9px] font-bold">Month</p>
                <p className="font-semibold text-white">{formatMonthLabel(hoveredTrend.month)}</p>
              </div>
              <div className="border-l border-white/5 pl-3">
                <p className="text-blue-400 font-bold">Invoiced: {formatCurrency(hoveredTrend.invoiced)}</p>
                <p className="text-emerald-400 font-bold">Collected: {formatCurrency(hoveredTrend.collected)}</p>
              </div>
            </div>
          )}

          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none"
              style={{ overflow: 'visible' }}
            >
              {/* Define Gradients */}
              <defs>
                <linearGradient id="invoicedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y Axis Grid Lines & Ticks */}
              {Array.from({ length: yTicks + 1 }).map((_, idx) => {
                const val = (idx / yTicks) * maxTrendVal;
                const y = getYCoordinate(val);
                return (
                  <g key={idx}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth={1}
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      fill="#94A3B8"
                      fontSize={10}
                      textAnchor="end"
                    >
                      {formatCurrency(val)}
                    </text>
                  </g>
                );
              })}

              {/* Area Paths (Behind Lines) */}
              <path d={getAreaPath('invoiced')} fill="url(#invoicedGrad)" />
              <path d={getAreaPath('collected')} fill="url(#collectedGrad)" />

              {/* Line Paths */}
              <path
                d={getLinePath('invoiced')}
                fill="none"
                stroke="#3B82F6"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <path
                d={getLinePath('collected')}
                fill="none"
                stroke="#10B981"
                strokeWidth={2.5}
                strokeLinecap="round"
              />

              {/* Interactive Circles / Hover Points */}
              {monthlyTrend.map((row, idx) => {
                const x = getXCoordinate(idx);
                const yInvoiced = getYCoordinate(row.invoiced);
                const yCollected = getYCoordinate(row.collected);

                return (
                  <g
                    key={idx}
                    onMouseEnter={() => setHoveredTrend(row)}
                    onMouseLeave={() => setHoveredTrend(null)}
                    className="cursor-pointer"
                  >
                    {/* Invisible hover bar */}
                    <rect
                      x={x - chartWidth / xCount / 2}
                      y={padding.top}
                      width={chartWidth / xCount}
                      height={chartHeight}
                      fill="transparent"
                    />

                    {/* Invoiced dot */}
                    <circle
                      cx={x}
                      cy={yInvoiced}
                      r={hoveredTrend?.month === row.month ? 5 : 3}
                      fill="#3B82F6"
                      stroke="#0F172A"
                      strokeWidth={1.5}
                    />

                    {/* Collected dot */}
                    <circle
                      cx={x}
                      cy={yCollected}
                      r={hoveredTrend?.month === row.month ? 5 : 3.5}
                      fill="#10B981"
                      stroke="#0F172A"
                      strokeWidth={1.5}
                    />
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {monthlyTrend.map((row, idx) => {
                const x = getXCoordinate(idx);
                // Draw label for alternate months or if small set to avoid overlapping
                const showLabel = xCount < 8 || idx % 2 === 0;

                return (
                  showLabel && (
                    <text
                      key={idx}
                      x={x}
                      y={chartHeight + padding.top + 20}
                      fill="#94A3B8"
                      fontSize={9}
                      textAnchor="middle"
                    >
                      {formatMonthLabel(row.month)}
                    </text>
                  )
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Distribution (Donut Chart) */}
      <Card className="bg-slate-900 border-white/5 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white">Payment Method Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center items-center relative min-h-[220px]">
          {donutSlices.length === 0 ? (
            <div className="text-center text-xs text-slate-500">No payment data recorded in this period.</div>
          ) : (
            <>
              {/* Dynamic Center Label */}
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                  {hoveredPayment ? hoveredPayment.method : 'Total Paid'}
                </span>
                <span className="text-lg font-extrabold text-white mt-0.5">
                  {formatCurrency(hoveredPayment ? hoveredPayment.amount : paymentBreakdown.reduce((sum, p) => sum + p.amount, 0))}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">
                  {hoveredPayment ? `${hoveredPayment.percentage.toFixed(1)}%` : '100%'}
                </span>
              </div>

              {/* SVG Donut */}
              <svg viewBox="0 0 120 120" className="w-40 h-40 transform -rotate-90 select-none">
                {donutSlices.map((slice, idx) => (
                  <circle
                    key={idx}
                    cx={60}
                    cy={60}
                    r={donutRadius}
                    fill="transparent"
                    stroke={getMethodColor(slice.method)}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={slice.offset}
                    transform={`rotate(${slice.rotation} 60 60)`}
                    strokeLinecap={slice.percentage === 100 ? 'butt' : 'round'}
                    onMouseEnter={() => setHoveredPayment(slice)}
                    onMouseLeave={() => setHoveredPayment(null)}
                    className="cursor-pointer transition-all duration-300 hover:opacity-85"
                    style={{ transformOrigin: 'center' }}
                  />
                ))}
              </svg>

              {/* Legends */}
              <div className="mt-4 grid grid-cols-2 gap-2 w-full text-xs">
                {paymentBreakdown.slice(0, 4).map((p, idx) => (
                  <div key={idx} className="flex items-center space-x-1">
                    <span
                      className="h-2 w-2 rounded-full inline-block"
                      style={{ backgroundColor: getMethodColor(p.method) }}
                    />
                    <span className="text-slate-400 capitalize max-w-[70px] truncate">{p.method.toLowerCase().replace('_', ' ')}</span>
                    <span className="text-slate-500 pl-0.5">({p.percentage.toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Invoice Status Distribution (Stacked Progress Bar) */}
      <Card className="lg:col-span-3 bg-slate-900 border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white">Invoice Volume by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {invoiceBreakdown.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-4">No invoices created in this period.</div>
          ) : (
            <div className="space-y-4">
              {/* Stacked Horizontal Bar */}
              <div className="h-6 w-full rounded-xl overflow-hidden flex bg-white/5 border border-white/5">
                {invoiceBreakdown
                  .filter((b) => b.count > 0)
                  .map((b, idx) => (
                    <div
                      key={idx}
                      className={`h-full transition-all duration-500 hover:brightness-110 ${getInvoiceStatusColor(
                        b.status
                      )}`}
                      style={{ width: `${b.percentage}%` }}
                      title={`${b.status}: ${b.count} (${b.percentage.toFixed(1)}%)`}
                    />
                  ))}
              </div>

              {/* Grid Legend with details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {invoiceBreakdown.map((b, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-white/5">
                    <div className="flex items-center space-x-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${getInvoiceStatusColor(b.status)}`} />
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white">
                      {b.count} <span className="text-slate-500 font-normal">({b.percentage.toFixed(0)}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
