import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, DollarSign, User } from 'lucide-react';
import { InvoiceWithItems, InvoiceStatus } from '../types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { InvoiceQuickActions } from './InvoiceQuickActions';
import type { InvoicePaymentSummary } from '@/features/payments/types';

interface Props {
  invoice: InvoiceWithItems;
  customerName: string;
  workspaceSlug: string;
  workspaceId: string;
  paymentSummary: InvoicePaymentSummary;
}

function MetaItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function InvoiceHeader({ invoice, customerName, workspaceSlug, workspaceId, paymentSummary }: Props) {
  const isOverdue =
    invoice.status === 'SENT' &&
    new Date(invoice.due_date) < new Date() &&
    invoice.status !== 'PAID';

  const effectiveStatus: InvoiceStatus = isOverdue ? 'OVERDUE' : (invoice.status as InvoiceStatus);

  return (
    <div className="space-y-4 border-b pb-6">
      {/* Back navigation */}
      <Link
        href={`/${workspaceSlug}/invoices`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Invoices
      </Link>

      {/* Main Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {/* Invoice Number + Status */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {invoice.invoice_number}
            </h1>
            <InvoiceStatusBadge status={effectiveStatus} />
          </div>

          {/* Customer */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-base text-muted-foreground">
              {customerName}
            </span>
          </div>

          {/* Metadata strip */}
          <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-1">
            <MetaItem icon={Calendar} label="Issued" value={formatDate(invoice.issue_date)} />
            <MetaItem icon={Clock} label="Due" value={formatDate(invoice.due_date)} />
            <MetaItem icon={DollarSign} label="Currency" value={invoice.currency} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="shrink-0">
          <InvoiceQuickActions
            invoice={invoice}
            workspaceId={workspaceId}
            workspaceSlug={workspaceSlug}
            paymentSummary={paymentSummary}
          />
        </div>
      </div>
    </div>
  );
}
