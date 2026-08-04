import { InvoicePaymentSummary } from '../types';
import { InvoiceStatus } from '@/features/invoices/types';
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge';

interface Props {
  summary: InvoicePaymentSummary;
  currency: string;
  invoiceStatus: InvoiceStatus;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

interface CardProps {
  label: string;
  value: string;
  colorClass: string;
  labelColorClass: string;
}

function SummaryCard({ label, value, colorClass, labelColorClass }: CardProps) {
  return (
    <div className={`rounded-xl border p-4 ${colorClass}`}>
      <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${labelColorClass}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold ${labelColorClass}`}>{value}</p>
    </div>
  );
}

export function PaymentSummaryCards({ summary, currency, invoiceStatus }: Props) {
  const isPaid = summary.outstanding <= 0;
  const isPartial = summary.totalPaid > 0 && !isPaid;

  return (
    <div className="space-y-4">
      {/* Status badge row */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Payment Summary
        </h2>
        <InvoiceStatusBadge status={invoiceStatus} />
      </div>

      {/* 3-card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Invoice Total — neutral */}
        <SummaryCard
          label="Invoice Total"
          value={formatCurrency(summary.invoiceTotal, currency)}
          colorClass="bg-muted/50 border-border"
          labelColorClass="text-foreground"
        />

        {/* Total Paid — green */}
        <SummaryCard
          label="Total Paid"
          value={formatCurrency(summary.totalPaid, currency)}
          colorClass={
            summary.totalPaid > 0
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              : 'bg-muted/30 border-border'
          }
          labelColorClass={
            summary.totalPaid > 0
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-muted-foreground'
          }
        />

        {/* Outstanding — red if any, green if zero */}
        <SummaryCard
          label="Outstanding"
          value={formatCurrency(summary.outstanding, currency)}
          colorClass={
            isPaid
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              : isPartial
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900'
          }
          labelColorClass={
            isPaid
              ? 'text-emerald-700 dark:text-emerald-400'
              : isPartial
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-red-700 dark:text-red-400'
          }
        />
      </div>

      {/* Financial breakdown */}
      <div className="rounded-lg border bg-card p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Grand Total</span>
          <span className="font-medium">{formatCurrency(summary.invoiceTotal, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Payments Made</span>
          <span className="font-medium text-emerald-600">
            {summary.payments.length} payment{summary.payments.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex justify-between border-t pt-2 mt-2">
          <span className="font-semibold text-foreground">Balance Due</span>
          <span className={`font-bold text-base ${isPaid ? 'text-emerald-600' : 'text-foreground'}`}>
            {formatCurrency(summary.outstanding, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
