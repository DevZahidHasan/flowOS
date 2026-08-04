'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Edit,
  Copy,
  Send,
  DollarSign,
  Trash2,
  Printer,
  FileDown,
  Mail,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InvoiceWithItems } from '../types';
import { updateInvoiceStatusAction, deleteInvoiceAction } from '../actions/invoice.actions';
import { useToast } from '@/hooks/use-toast';
import { RecordPaymentSheet } from '@/features/payments/components/RecordPaymentSheet';
import type { InvoicePaymentSummary } from '@/features/payments/types';

interface Props {
  invoice: InvoiceWithItems;
  workspaceId: string;
  workspaceSlug: string;
  paymentSummary: InvoicePaymentSummary;
}

type FutureAction = 'print' | 'export-pdf' | 'email';

export function InvoiceQuickActions({ invoice, workspaceId, workspaceSlug, paymentSummary }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);

  const status    = invoice.status;
  const isDraft   = status === 'DRAFT';
  const isSent    = status === 'SENT' || status === 'OVERDUE' || status === 'PARTIALLY_PAID';
  const isFinal   = status === 'PAID' || status === 'CANCELLED' || status === 'REFUNDED';
  const canPay    = isSent && paymentSummary.outstanding > 0;

  const handleMarkSent = () => {
    startTransition(async () => {
      const res = await updateInvoiceStatusAction(workspaceId, invoice.id, 'SENT');
      if (res.error) {
        toast({ title: 'Action failed', description: res.error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Invoice marked as sent' });
        router.refresh();
      }
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      const res = await updateInvoiceStatusAction(workspaceId, invoice.id, 'CANCELLED');
      if (res.error) {
        toast({ title: 'Action failed', description: res.error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Invoice cancelled' });
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    startTransition(async () => {
      const res = await deleteInvoiceAction(workspaceId, invoice.id);
      if (res.error) {
        toast({ title: 'Delete failed', description: res.error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Invoice deleted' });
        router.push(`/${workspaceSlug}/invoices`);
      }
    });
  };

  const handleFutureAction = (action: FutureAction) => {
    toast({
      title: 'Coming Soon',
      description: `${action === 'print' ? 'Print' : action === 'export-pdf' ? 'PDF Export' : 'Email Sending'} will be available in a future update.`,
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Primary: Mark Sent (draft only) */}
        {isDraft && (
          <Button size="sm" onClick={handleMarkSent} disabled={isPending} className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Mark Sent
          </Button>
        )}

        {/* Primary: Record Payment (sent / partial only) */}
        {canPay && (
          <Button
            size="sm"
            onClick={() => setIsPaymentSheetOpen(true)}
            disabled={isPending}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <DollarSign className="h-3.5 w-3.5" />
            Record Payment
          </Button>
        )}

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5" aria-label="More actions">
              <MoreHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {isDraft && (
              <DropdownMenuItem
                onClick={() => router.push(`/${workspaceSlug}/invoices/${invoice.id}/edit`)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Invoice
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => router.push(`/${workspaceSlug}/invoices/new?duplicate=${invoice.id}`)}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Active print/export actions */}
            <DropdownMenuItem onClick={() => window.print()} className="gap-2 cursor-pointer">
              <Printer className="h-4 w-4" />
              Print
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => window.print()} className="gap-2 cursor-pointer">
              <FileDown className="h-4 w-4" />
              Export PDF
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled
              onClick={() => handleFutureAction('email')}
              className="gap-2 text-muted-foreground"
            >
              <Mail className="h-4 w-4" />
              Send Email
              <span className="ml-auto text-[10px] border rounded px-1">Soon</span>
            </DropdownMenuItem>

            {/* Danger zone */}
            {!isFinal && (
              <>
                <DropdownMenuSeparator />
                {isDraft && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    {confirmDelete ? 'Confirm Delete' : 'Delete Draft'}
                  </DropdownMenuItem>
                )}
                {isSent && (
                  <DropdownMenuItem
                    onClick={handleCancel}
                    className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Cancel Invoice
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Record Payment Sheet */}
      <RecordPaymentSheet
        isOpen={isPaymentSheetOpen}
        onClose={() => setIsPaymentSheetOpen(false)}
        workspaceId={workspaceId}
        invoiceId={invoice.id}
        currency={invoice.currency}
        summary={paymentSummary}
      />
    </>
  );
}
