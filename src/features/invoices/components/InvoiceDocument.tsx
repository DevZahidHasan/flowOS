import { InvoiceWithItems, InvoiceStatus } from '../types';
import { Workspace } from '@/types/global';
import { Customer } from '@/features/crm/types';
import type { InvoicePaymentSummary } from '@/features/payments/types';
import { InvoiceBranding } from './InvoiceBranding';
import { InvoiceTotals } from './InvoiceTotals';
import { InvoiceFooter } from './InvoiceFooter';
import { cn } from '@/lib/utils';

interface Props {
  invoice: InvoiceWithItems;
  workspace: Workspace;
  customer: Customer;
  paymentSummary: InvoicePaymentSummary;
  moduleSettings?: Record<string, unknown>;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function InvoiceDocument({
  invoice,
  workspace,
  customer,
  paymentSummary,
  moduleSettings,
}: Props) {
  const isOverdue =
    invoice.status === 'SENT' &&
    new Date(invoice.due_date) < new Date();

  const effectiveStatus: InvoiceStatus = isOverdue ? 'OVERDUE' : (invoice.status as InvoiceStatus);

  // Status Watermark Styles
  const watermarkConfig: Record<
    InvoiceStatus,
    { label: string; bgClass: string; textClass: string; borderClass: string }
  > = {
    DRAFT: {
      label: 'DRAFT',
      bgClass: 'bg-slate-500/5',
      textClass: 'text-slate-500/10 border-slate-500/10',
      borderClass: 'border-slate-500/20',
    },
    SENT: {
      label: 'UNPAID',
      bgClass: 'bg-blue-500/5',
      textClass: 'text-blue-500/10 border-blue-500/10',
      borderClass: 'border-blue-500/20',
    },
    PARTIALLY_PAID: {
      label: 'PART PAYMENT',
      bgClass: 'bg-amber-500/5',
      textClass: 'text-amber-500/10 border-amber-500/10',
      borderClass: 'border-amber-500/20',
    },
    PAID: {
      label: 'PAID IN FULL',
      bgClass: 'bg-emerald-500/5',
      textClass: 'text-emerald-500/10 border-emerald-500/10',
      borderClass: 'border-emerald-500/20',
    },
    OVERDUE: {
      label: 'OVERDUE',
      bgClass: 'bg-rose-500/5',
      textClass: 'text-rose-500/10 border-rose-500/10',
      borderClass: 'border-rose-500/20',
    },
    CANCELLED: {
      label: 'CANCELLED',
      bgClass: 'bg-neutral-500/5',
      textClass: 'text-neutral-500/10 border-neutral-500/10',
      borderClass: 'border-neutral-500/20',
    },
    REFUNDED: {
      label: 'REFUNDED',
      bgClass: 'bg-purple-500/5',
      textClass: 'text-purple-500/10 border-purple-500/10',
      borderClass: 'border-purple-500/20',
    },
  };

  const watermark = watermarkConfig[effectiveStatus] || watermarkConfig.DRAFT;

  return (
    <div className="relative overflow-hidden w-full bg-white text-black p-6 sm:p-12 border rounded-xl shadow-sm max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
      
      {/* ─────────────────────────────────────────────────────────────
          Invoice Status Watermark (Subtle and Large background text)
          ───────────────────────────────────────────────────────────── */}
      <div 
        className={cn(
          "absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden",
          watermark.bgClass
        )}
        aria-hidden="true"
      >
        <div className="transform -rotate-12 text-[4rem] sm:text-[7rem] md:text-[10rem] font-extrabold tracking-widest border-8 rounded-2xl px-6 py-2 uppercase border-dashed select-none text-center leading-none scale-100 opacity-60">
          <span className={watermark.textClass}>{watermark.label}</span>
        </div>
      </div>

      {/* Main Content (Z-index 1 to sit above watermark) */}
      <div className="relative z-10 space-y-8">
        
        {/* Branding header: Logo + Contact Info */}
        <InvoiceBranding workspace={workspace} moduleSettings={moduleSettings} />

        {/* Invoice details & Customer Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Billing Info */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Billed To:
            </h3>
            <div>
              <p className="font-bold text-sm text-foreground">{customer.fullName}</p>
              {customer.email && <p className="text-xs text-muted-foreground">{customer.email}</p>}
              {customer.phone && <p className="text-xs text-muted-foreground">{customer.phone}</p>}
              {/* Future-ready Billing Address */}
              <p className="text-xs text-muted-foreground italic mt-1 leading-relaxed">
                Billing Address (future ready)
              </p>
            </div>
          </div>

          {/* Invoice Metadata */}
          <div className="space-y-1 text-xs md:text-right">
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Invoice Details:
            </h3>
            <p>
              <span className="text-muted-foreground">Invoice #:</span>{' '}
              <span className="font-mono font-bold text-foreground">{invoice.invoice_number}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Status:</span>{' '}
              <span className="font-semibold uppercase text-foreground">{effectiveStatus}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Issue Date:</span>{' '}
              <span className="text-foreground">{formatDate(invoice.issue_date)}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Due Date:</span>{' '}
              <span className={cn("text-foreground", isOverdue && "text-rose-600 font-semibold")}>
                {formatDate(invoice.due_date)} {isOverdue && '(Overdue)'}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Currency:</span>{' '}
              <span className="text-foreground font-semibold">{invoice.currency}</span>
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" aria-label="Invoice Line Items">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5 text-center w-16">Qty</th>
                  <th className="py-2.5 text-right w-24">Price</th>
                  <th className="py-2.5 text-right w-20">Discount</th>
                  <th className="py-2.5 text-right w-16">Tax %</th>
                  <th className="py-2.5 text-right w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-foreground">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3">
                      <span className="font-medium text-foreground">{item.description}</span>
                    </td>
                    <td className="py-3 text-center text-muted-foreground">{item.quantity}</td>
                    <td className="py-3 text-right text-muted-foreground">
                      {formatCurrency(Number(item.unit_price), invoice.currency)}
                    </td>
                    <td className="py-3 text-right">
                      {Number(item.discount) > 0 ? (
                        <span className="text-emerald-600">
                          -{formatCurrency(Number(item.discount), invoice.currency)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {Number(item.tax_rate) > 0 ? `${Number(item.tax_rate)}%` : '—'}
                    </td>
                    <td className="py-3 text-right font-semibold text-foreground">
                      {formatCurrency(Number(item.total), invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Totals */}
        <InvoiceTotals invoice={invoice} paymentSummary={paymentSummary} />

        {/* Footer Notes & Signatures */}
        <InvoiceFooter invoice={invoice} workspace={workspace} moduleSettings={moduleSettings} />

      </div>
    </div>
  );
}
