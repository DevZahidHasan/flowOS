'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { recordPaymentAction } from '../actions/payment.actions';
import { PAYMENT_METHODS, PaymentMethod, InvoicePaymentSummary } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  invoiceId: string;
  currency: string;
  summary: InvoicePaymentSummary;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function RecordPaymentSheet({
  isOpen,
  onClose,
  workspaceId,
  invoiceId,
  currency,
  summary,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [receivedBy, setReceivedBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset form when sheet opens
  useEffect(() => {
    if (isOpen) {
      setAmount(summary.outstanding > 0 ? summary.outstanding.toFixed(2) : '');
      setPaymentMethod('CASH');
      setReferenceNumber('');
      setNotes('');
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setReceivedBy('');
      setErrorMsg(null);
    }
  }, [isOpen, summary.outstanding]);

  const parsedAmount = parseFloat(amount) || 0;
  const exceedsBalance = parsedAmount > summary.outstanding + 0.001;
  const isAmountInvalid = parsedAmount <= 0 || exceedsBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAmountInvalid) return;
    setErrorMsg(null);
    setLoading(true);

    const res = await recordPaymentAction({
      workspace_id:    workspaceId,
      invoice_id:      invoiceId,
      amount:          parsedAmount,
      payment_method:  paymentMethod,
      reference_number: referenceNumber || null,
      notes:           notes || null,
      payment_date:    new Date(`${paymentDate}T12:00:00.000Z`).toISOString(),
      received_by:     receivedBy || null,
    });

    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    toast({
      title: 'Payment recorded',
      description: `${formatCurrency(parsedAmount, currency)} payment recorded successfully.`,
    });
    onClose();
    router.refresh();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className="w-full sm:max-w-lg overflow-y-auto"
        aria-label="Record payment"
      >
        <SheetHeader className="mb-6">
          <SheetTitle>Record Payment</SheetTitle>
          <SheetDescription>
            Record a real-world payment — cash, card, transfer, or mobile banking.
          </SheetDescription>
        </SheetHeader>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="rounded-lg border bg-muted/40 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Invoice Total</p>
            <p className="text-sm font-bold text-foreground">
              {formatCurrency(summary.invoiceTotal, currency)}
            </p>
          </div>
          <div className="rounded-lg border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 p-3 text-center">
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1">Paid</p>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(summary.totalPaid, currency)}
            </p>
          </div>
          <div className={`rounded-lg border p-3 text-center ${
            summary.outstanding <= 0
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
          }`}>
            <p className={`text-[10px] uppercase tracking-wide mb-1 ${
              summary.outstanding <= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-amber-700 dark:text-amber-400'
            }`}>
              Outstanding
            </p>
            <p className={`text-sm font-bold ${
              summary.outstanding <= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-amber-700 dark:text-amber-400'
            }`}>
              {formatCurrency(summary.outstanding, currency)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm" role="alert">
              {errorMsg}
            </div>
          )}

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="rp-amount">
              Amount ({currency})
              {exceedsBalance && (
                <span className="ml-2 text-destructive text-xs font-normal">
                  Exceeds outstanding balance
                </span>
              )}
            </Label>
            <Input
              id="rp-amount"
              type="number"
              step="0.01"
              min="0.01"
              max={summary.outstanding}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={exceedsBalance ? 'border-destructive focus-visible:ring-destructive' : ''}
              required
              aria-describedby={exceedsBalance ? 'rp-amount-error' : undefined}
            />
            {exceedsBalance && (
              <p id="rp-amount-error" className="text-xs text-destructive">
                Maximum: {formatCurrency(summary.outstanding, currency)}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <Label htmlFor="rp-method">Payment Method</Label>
            <select
              id="rp-method"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Date */}
          <div className="space-y-1.5">
            <Label htmlFor="rp-date">Payment Date</Label>
            <Input
              id="rp-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              min="2000-01-01"
            />
          </div>

          {/* Reference Number */}
          <div className="space-y-1.5">
            <Label htmlFor="rp-ref">
              Reference Number
              <span className="ml-1 text-muted-foreground text-xs font-normal">(optional)</span>
            </Label>
            <Input
              id="rp-ref"
              placeholder="e.g. TXN-82763, Receipt #1234"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>

          {/* Received By */}
          <div className="space-y-1.5">
            <Label htmlFor="rp-received-by">
              Received By
              <span className="ml-1 text-muted-foreground text-xs font-normal">(optional)</span>
            </Label>
            <Input
              id="rp-received-by"
              placeholder="e.g. Front Desk, John"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="rp-notes">
              Internal Notes
              <span className="ml-1 text-muted-foreground text-xs font-normal">(optional)</span>
            </Label>
            <Input
              id="rp-notes"
              placeholder="e.g. Paid in two instalments"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || isAmountInvalid || summary.outstanding <= 0}
            >
              {loading ? 'Recording…' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
