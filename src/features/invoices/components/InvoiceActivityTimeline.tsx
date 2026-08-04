import { InvoiceWithItems, InvoiceStatus } from '../types';
import type { PaymentRow } from '@/features/payments/types';

// ─────────────────────────────────────────────────────────────────
// Extensible event type union — add new types here, not in consumers
// ─────────────────────────────────────────────────────────────────
export type TimelineEventType =
  | 'INVOICE_CREATED'
  | 'STATUS_CHANGED'
  | 'INVOICE_UPDATED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_DELETED'
  | 'REFUND_ISSUED'        // Future Phase 7
  | 'EMAIL_SENT'           // Future Phase 7
  | 'NOTE_ADDED'           // Future Phase 7
  | 'ATTACHMENT_UPLOADED'; // Future Phase 7

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string | null;
  timestamp: string;
  actor?: string;
  metadata?: Record<string, unknown>;
}

const EVENT_ICONS: Record<TimelineEventType, string> = {
  INVOICE_CREATED:    '🧾',
  STATUS_CHANGED:     '🔄',
  INVOICE_UPDATED:    '✏️',
  PAYMENT_RECEIVED:   '💰',
  PAYMENT_DELETED:    '🗑️',
  REFUND_ISSUED:      '↩️',
  EMAIL_SENT:         '📧',
  NOTE_ADDED:         '📝',
  ATTACHMENT_UPLOADED:'📎',
};

function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function TimelineItem({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border text-sm"
          aria-hidden="true"
        >
          {EVENT_ICONS[event.type]}
        </div>
        {!isLast && <div className="w-px flex-1 bg-border mt-1 min-h-[16px]" aria-hidden="true" />}
      </div>

      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">{event.title}</p>
            {event.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
            )}
            {event.actor && (
              <p className="text-xs text-muted-foreground mt-0.5">by {event.actor}</p>
            )}
          </div>
          <time
            className="text-xs text-muted-foreground whitespace-nowrap shrink-0"
            dateTime={event.timestamp}
          >
            {formatDateTime(event.timestamp)}
          </time>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Build merged timeline from invoice + payments
// Future: replace synthetic events with DB-stored audit log entries
// ─────────────────────────────────────────────────────────────────
function buildTimeline(invoice: InvoiceWithItems, payments: PaymentRow[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Invoice creation — always present
  events.push({
    id: `${invoice.id}-created`,
    type: 'INVOICE_CREATED',
    title: 'Invoice Created',
    description: `Invoice ${invoice.invoice_number} was created as a draft.`,
    timestamp: invoice.created_at,
  });

  // Payment events — real records from DB
  for (const payment of payments) {
    events.push({
      id: `payment-${payment.id}`,
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Recorded',
      description: `${formatCurrency(Number(payment.amount))} via ${payment.payment_method.replace('_', ' ')}${payment.reference_number ? ` · Ref: ${payment.reference_number}` : ''}`,
      timestamp: payment.payment_date,
      actor: payment.received_by ?? undefined,
    });
  }

  // Status-change event derived from current status
  if (invoice.status !== 'DRAFT' && invoice.updated_at !== invoice.created_at) {
    const statusLabels: Partial<Record<InvoiceStatus, string>> = {
      SENT:           'Invoice Sent',
      PARTIALLY_PAID: 'Invoice Partially Paid',
      PAID:           'Invoice Fully Paid',
      CANCELLED:      'Invoice Cancelled',
      REFUNDED:       'Invoice Refunded',
      OVERDUE:        'Invoice Overdue',
    };
    const label = statusLabels[invoice.status as InvoiceStatus];
    if (label && invoice.status !== 'PARTIALLY_PAID' && invoice.status !== 'PAID') {
      // For payment-driven statuses, we already have payment events above
      events.push({
        id: `${invoice.id}-status`,
        type: 'STATUS_CHANGED',
        title: label,
        description: `Status updated to ${invoice.status.replace(/_/g, ' ')}.`,
        timestamp: invoice.updated_at,
      });
    }
  }

  // Sort newest-first
  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

interface Props {
  invoice: InvoiceWithItems;
  payments: PaymentRow[];
}

export function InvoiceActivityTimeline({ invoice, payments }: Props) {
  const events = buildTimeline(invoice, payments);

  return (
    <div className="space-y-4" role="tabpanel" id="tabpanel-activity">
      <div className="rounded-lg border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-5">
          Activity Timeline
        </h2>

        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No activity recorded yet.</p>
        ) : (
          <div role="list" aria-label="Invoice activity timeline">
            {events.map((event, idx) => (
              <div key={event.id} role="listitem">
                <TimelineItem event={event} isLast={idx === events.length - 1} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 pt-4 border-t">
          <p className="text-xs text-muted-foreground italic">
            Full audit logging (emails, attachments, refunds) will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
