import { InvoiceWithItems, InvoiceStatus } from '../types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';

// ─────────────────────────────────────────────────────────────────
// Status history types — ready for DB-backed audit log in future
// ─────────────────────────────────────────────────────────────────
export interface StatusHistoryEntry {
  from: InvoiceStatus | null;
  to: InvoiceStatus;
  timestamp: string;
  actor?: string;
}

const STATUS_ORDER: InvoiceStatus[] = [
  'DRAFT',
  'SENT',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'CANCELLED',
  'REFUNDED',
];

function getStatusDescription(status: InvoiceStatus): string {
  const descriptions: Record<InvoiceStatus, string> = {
    DRAFT: 'Invoice created and saved as draft.',
    SENT: 'Invoice sent to customer for payment.',
    PARTIALLY_PAID: 'Partial payment received from customer.',
    PAID: 'Invoice fully paid. No outstanding balance.',
    OVERDUE: 'Payment not received by due date.',
    CANCELLED: 'Invoice cancelled and voided.',
    REFUNDED: 'Payment has been refunded to customer.',
  };
  return descriptions[status];
}

// Build a lightweight status progression display from the invoice
function buildStatusHistory(invoice: InvoiceWithItems): StatusHistoryEntry[] {
  const history: StatusHistoryEntry[] = [
    {
      from: null,
      to: 'DRAFT',
      timestamp: invoice.created_at,
    },
  ];

  if (invoice.status !== 'DRAFT') {
    history.push({
      from: 'DRAFT',
      to: invoice.status as InvoiceStatus,
      timestamp: invoice.updated_at,
    });
  }

  return history;
}

interface Props {
  invoice: InvoiceWithItems;
}

export function InvoiceStatusHistory({ invoice }: Props) {
  const history = buildStatusHistory(invoice);
  const currentStatus = invoice.status as InvoiceStatus;

  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Status History
        </h2>
        <InvoiceStatusBadge status={currentStatus} />
      </div>

      {/* Status progression */}
      <div className="space-y-2">
        {history.map((entry, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 rounded-md p-2.5 text-sm ${
              entry.to === currentStatus
                ? 'bg-primary/5 border border-primary/20'
                : 'bg-muted/30'
            }`}
          >
            <InvoiceStatusBadge status={entry.to} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {getStatusDescription(entry.to)}
              </p>
            </div>
            <time
              className="text-xs text-muted-foreground whitespace-nowrap shrink-0"
              dateTime={entry.timestamp}
            >
              {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
              }).format(new Date(entry.timestamp))}
            </time>
          </div>
        ))}
      </div>

      {/* Future statuses preview */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">Next possible transitions:</p>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_ORDER.filter(
            (s) =>
              s !== currentStatus &&
              (currentStatus === 'DRAFT'
                ? ['SENT', 'CANCELLED'].includes(s)
                : currentStatus === 'SENT'
                ? ['PARTIALLY_PAID', 'PAID', 'CANCELLED'].includes(s)
                : currentStatus === 'PARTIALLY_PAID'
                ? ['PAID'].includes(s)
                : currentStatus === 'PAID'
                ? ['REFUNDED'].includes(s)
                : [])
          ).map((s) => (
            <InvoiceStatusBadge key={s} status={s} className="opacity-50" />
          ))}
          {['PAID', 'CANCELLED', 'REFUNDED'].includes(currentStatus) && (
            <span className="text-xs text-muted-foreground italic self-center">
              No further transitions available
            </span>
          )}
        </div>
      </div>

      {/* Full audit trail note */}
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground italic">
          Full status audit trail with actor tracking coming in a future update.
        </p>
      </div>
    </div>
  );
}
