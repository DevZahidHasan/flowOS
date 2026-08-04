import { InvoiceWithItems } from '../types';
import type { InvoicePaymentSummary } from '@/features/payments/types';

interface Props {
  invoice: InvoiceWithItems;
  paymentSummary: InvoicePaymentSummary;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function InvoiceTotals({ invoice, paymentSummary }: Props) {
  const currency = invoice.currency;
  const subtotal = Number(invoice.subtotal);
  const discount = Number(invoice.discount_amount);
  const tax = Number(invoice.tax_amount);
  const total = Number(invoice.total_amount);
  const paid = paymentSummary.totalPaid;
  const outstanding = paymentSummary.outstanding;

  return (
    <div className="flex justify-end pt-6">
      <div className="w-full sm:w-80 space-y-2.5 text-sm text-muted-foreground">
        {/* Subtotal */}
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-foreground">{formatCurrency(subtotal, currency)}</span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span className="font-medium text-emerald-600">-{formatCurrency(discount, currency)}</span>
          </div>
        )}

        {/* Tax */}
        {tax > 0 && (
          <div className="flex justify-between">
            <span>Tax</span>
            <span className="font-medium text-foreground">{formatCurrency(tax, currency)}</span>
          </div>
        )}

        {/* Grand Total */}
        <div className="flex justify-between border-t border-border/60 pt-3">
          <span className="font-semibold text-foreground">Grand Total</span>
          <span className="font-bold text-foreground text-base">
            {formatCurrency(total, currency)}
          </span>
        </div>

        {/* Total Paid */}
        {paid > 0 && (
          <div className="flex justify-between">
            <span>Total Paid</span>
            <span className="font-medium text-emerald-600">-{formatCurrency(paid, currency)}</span>
          </div>
        )}

        {/* Outstanding Balance */}
        <div className="flex justify-between border-t border-border/60 pt-3">
          <span className="font-semibold text-foreground">Outstanding Balance</span>
          <span className={`font-bold text-base ${outstanding <= 0 ? 'text-emerald-600' : 'text-primary'}`}>
            {formatCurrency(outstanding, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
