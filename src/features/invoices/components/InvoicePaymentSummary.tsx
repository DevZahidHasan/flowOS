import { InvoicePaymentSummary } from '@/features/payments/types';
import { InvoiceWithItems, InvoiceStatus } from '../types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';

interface Props {
  invoice: InvoiceWithItems;
  summary: InvoicePaymentSummary;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

interface SummaryRowProps {
  label: string;
  value: string;
  variant?: 'default' | 'discount' | 'total' | 'outstanding' | 'paid';
}

function SummaryRow({ label, value, variant = 'default' }: SummaryRowProps) {
  const valueClass =
    variant === 'discount' ? 'text-emerald-600 font-medium'
    : variant === 'paid'   ? 'text-emerald-600 font-semibold'
    : variant === 'total'  ? 'text-foreground font-bold text-base'
    : variant === 'outstanding' ? 'text-primary font-bold text-base'
    : 'text-foreground font-medium';

  const isBig = variant === 'total' || variant === 'outstanding';

  return (
    <div className={`flex items-center justify-between py-2 ${isBig ? 'border-t mt-1 pt-3' : 'border-b border-border/40 last:border-0'}`}>
      <span className={`text-sm ${isBig ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}

export function InvoicePaymentSummary({ invoice, summary }: Props) {
  const currency = invoice.currency;
  const subtotal = Number(invoice.subtotal);
  const discount = Number(invoice.discount_amount);
  const tax      = Number(invoice.tax_amount);

  const isOverdue = invoice.status === 'SENT' && new Date(invoice.due_date) < new Date();
  const effectiveStatus: InvoiceStatus = isOverdue ? 'OVERDUE' : (invoice.status as InvoiceStatus);

  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Payment Summary
        </h2>
        <InvoiceStatusBadge status={effectiveStatus} />
      </div>

      {/* Invoice breakdown */}
      <div className="space-y-0">
        <SummaryRow label="Subtotal" value={formatCurrency(subtotal, currency)} />
        {discount > 0 && (
          <SummaryRow label="Discount" value={`-${formatCurrency(discount, currency)}`} variant="discount" />
        )}
        {tax > 0 && (
          <SummaryRow label="Tax" value={formatCurrency(tax, currency)} />
        )}
        <SummaryRow label="Grand Total" value={formatCurrency(summary.invoiceTotal, currency)} variant="total" />
      </div>

      {/* Live payment data */}
      {summary.totalPaid > 0 && (
        <SummaryRow
          label={`Paid (${summary.payments.length} payment${summary.payments.length !== 1 ? 's' : ''})`}
          value={`-${formatCurrency(summary.totalPaid, currency)}`}
          variant="paid"
        />
      )}

      {/* Outstanding balance — real-time from payments */}
      <div className={`rounded-md p-3 border ${
        summary.outstanding <= 0
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
          : summary.totalPaid > 0
          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
          : 'bg-muted/50 border-border/50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Outstanding Balance</p>
            <p className={`text-lg font-bold mt-0.5 ${
              summary.outstanding <= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : summary.totalPaid > 0
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-foreground'
            }`}>
              {formatCurrency(summary.outstanding, currency)}
            </p>
          </div>
          {summary.outstanding <= 0 && (
            <div className="text-2xl" aria-label="Paid in full">✅</div>
          )}
        </div>
      </div>
    </div>
  );
}
