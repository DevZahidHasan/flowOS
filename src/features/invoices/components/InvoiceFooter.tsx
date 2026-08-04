import { InvoiceWithItems } from '../types';
import { getBrandingSettings } from './InvoiceBranding';
import { Workspace } from '@/types/global';

interface Props {
  invoice: InvoiceWithItems;
  workspace: Workspace;
  moduleSettings?: Record<string, unknown>;
}

export function InvoiceFooter({ invoice, workspace, moduleSettings }: Props) {
  const branding = getBrandingSettings(workspace, moduleSettings);

  return (
    <div className="pt-8 border-t space-y-6 text-xs text-muted-foreground mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes / Terms & Conditions placeholder */}
        <div className="space-y-2">
          {invoice.notes && (
            <div>
              <p className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                Notes
              </p>
              <p className="mt-1 leading-relaxed whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
          
          {/* Extension point: Terms & Conditions */}
          <div className="pt-2">
            <p className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
              Terms & Conditions
            </p>
            <p className="mt-1 leading-relaxed">
              Payment is due within {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(invoice.due_date))} days of invoice date. 
              Late payments may be subject to additional fees.
            </p>
          </div>
        </div>

        {/* Future features extension points (Digital Signature, QR Code, Payment Gateway Links) */}
        <div className="space-y-4 md:text-right flex flex-col justify-between items-start md:items-end">
          {/* Extension point: Digital Signature Placeholder */}
          <div className="border border-dashed border-border rounded-lg p-3 w-48 text-center bg-muted/20">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
              E-Invoice Signature
            </p>
            <div className="h-8 flex items-center justify-center italic text-muted-foreground/60 text-xs">
              Verified Digitally
            </div>
            <div className="h-px bg-border my-1.5" />
            <p className="text-[8px] text-muted-foreground/50">FlowOS Trust Platform</p>
          </div>

          {/* Extension point: QR Code Placeholder */}
          <div className="text-[10px] space-y-1">
            <p className="font-semibold text-foreground">Scan to Pay or Verify</p>
            <div className="inline-block p-1 bg-white border border-border rounded-md">
              <div className="h-16 w-16 bg-muted/40 border border-dashed flex items-center justify-center text-[10px] text-muted-foreground font-mono">
                [QR]
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thank you message & branding footer */}
      <div className="text-center pt-6 border-t border-border/40">
        <p className="font-medium text-foreground text-sm">
          {branding.thankYouMessage}
        </p>
        <p className="mt-1 text-[10px]">
          Invoice generated via <span className="font-bold text-foreground">FlowOS</span>
        </p>
      </div>
    </div>
  );
}
