import { InvoiceWithItems } from '../types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';

interface Props {
  invoice: InvoiceWithItems;
  customerName: string;
  customerEmail: string | null;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground shrink-0 min-w-[100px]">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
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

export function InvoiceOverview({ invoice, customerName, customerEmail }: Props) {
  const isOverdue =
    invoice.status === 'SENT' && new Date(invoice.due_date) < new Date();

  return (
    <div className="space-y-5" role="tabpanel" id="tabpanel-overview">
      {/* Invoice Information */}
      <div className="rounded-lg border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
          Invoice Details
        </h2>
        <div className="space-y-0">
          <InfoRow label="Invoice #" value={<span className="font-mono">{invoice.invoice_number}</span>} />
          <InfoRow
            label="Status"
            value={
              <InvoiceStatusBadge
                status={isOverdue ? 'OVERDUE' : invoice.status}
              />
            }
          />
          <InfoRow label="Currency" value={invoice.currency} />
          <InfoRow label="Issue Date" value={formatDate(invoice.issue_date)} />
          <InfoRow label="Due Date" value={
            <span className={isOverdue ? 'text-destructive font-semibold' : ''}>
              {formatDate(invoice.due_date)}
              {isOverdue && ' (Overdue)'}
            </span>
          } />
          <InfoRow label="Created" value={formatDate(invoice.created_at)} />
          <InfoRow label="Last Updated" value={formatDate(invoice.updated_at)} />
        </div>
      </div>

      {/* Billing Information */}
      <div className="rounded-lg border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
          Billing To
        </h2>
        <div className="space-y-0">
          <InfoRow label="Customer" value={customerName} />
          {customerEmail && <InfoRow label="Email" value={customerEmail} />}
          {invoice.appointment_id && (
            <InfoRow label="Appointment" value={<span className="font-mono text-xs">{invoice.appointment_id.slice(0, 8)}…</span>} />
          )}
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
            Notes
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {invoice.notes}
          </p>
        </div>
      )}
    </div>
  );
}
