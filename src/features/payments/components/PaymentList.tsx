'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PaymentRow, PAYMENT_METHODS } from '../types';
import { deletePaymentAction } from '../actions/payment.actions';

interface Props {
  payments: PaymentRow[];
  workspaceId: string;
  currency: string;
  invoiceStatus: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function getMethodLabel(method: PaymentRow['payment_method']): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}

const METHOD_ICONS: Record<PaymentRow['payment_method'], string> = {
  CASH:           '💵',
  CARD:           '💳',
  BANK_TRANSFER:  '🏦',
  MOBILE_BANKING: '📱',
  CHEQUE:         '📄',
  OTHER:          '🔄',
};

interface PaymentItemProps {
  payment: PaymentRow;
  workspaceId: string;
  currency: string;
  canDelete: boolean;
}

function PaymentItem({ payment, workspaceId, currency, canDelete }: PaymentItemProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deletePaymentAction(workspaceId, payment.id);
      if (res.error) {
        toast({ title: 'Delete failed', description: res.error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Payment removed', description: 'The payment record has been deleted.' });
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-start gap-3 py-4 border-b last:border-0">
      {/* Method icon */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-lg"
        aria-hidden="true"
      >
        {METHOD_ICONS[payment.payment_method]}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(Number(payment.amount), currency)}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {getMethodLabel(payment.payment_method)}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(payment.payment_date)}
              {payment.received_by && ` · ${payment.received_by}`}
            </p>
          </div>

          {/* Delete — only show if invoice is not in terminal state */}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
              onClick={handleDelete}
              disabled={isPending}
              aria-label={`Delete payment of ${formatCurrency(Number(payment.amount), currency)}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Optional fields */}
        {(payment.reference_number || payment.notes) && (
          <div className="mt-1.5 space-y-0.5">
            {payment.reference_number && (
              <p className="text-xs text-muted-foreground">
                Ref: <span className="font-mono">{payment.reference_number}</span>
              </p>
            )}
            {payment.notes && (
              <p className="text-xs text-muted-foreground italic">{payment.notes}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function PaymentList({ payments, workspaceId, currency, invoiceStatus }: Props) {
  // Cannot delete payments on finalized invoices
  const canDelete = !['CANCELLED', 'REFUNDED'].includes(invoiceStatus);

  if (payments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
        <p className="text-2xl mb-2" aria-hidden="true">💳</p>
        <p className="text-sm font-medium text-foreground">No payments recorded</p>
        <p className="text-xs text-muted-foreground mt-1">
          Payments recorded here will automatically update the invoice balance.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border bg-card divide-y divide-border overflow-hidden"
      role="list"
      aria-label="Payment records"
    >
      {payments.map((payment) => (
        <div key={payment.id} role="listitem" className="px-4">
          <PaymentItem
            payment={payment}
            workspaceId={workspaceId}
            currency={currency}
            canDelete={canDelete}
          />
        </div>
      ))}
    </div>
  );
}
