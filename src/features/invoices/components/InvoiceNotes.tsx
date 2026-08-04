import { InvoiceWithItems } from '../types';

interface Props {
  invoice: InvoiceWithItems;
}

export function InvoiceNotes({ invoice }: Props) {
  return (
    <div className="space-y-4" role="tabpanel" id="tabpanel-notes">
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Invoice Notes
          </h2>
          {/* Future: Edit Notes button will appear here */}
          <span className="text-xs text-muted-foreground italic">Read-only</span>
        </div>

        {invoice.notes ? (
          <div className="rounded-md bg-muted/50 border border-border/50 p-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border p-8 text-center">
            <p className="text-2xl mb-2" aria-hidden="true">📝</p>
            <p className="text-sm font-medium text-foreground">No notes on this invoice</p>
            <p className="text-xs text-muted-foreground mt-1">
              Notes can be added when creating or editing an invoice.
            </p>
          </div>
        )}

        {/* Future: Note editing will be added here in Phase 6 */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground italic">
            Inline note editing and internal staff comments are coming in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
