import { PrintInvoice } from './PrintInvoice';
import { ExportInvoiceButton } from './ExportInvoiceButton';
import { ShareInvoiceMenu } from './ShareInvoiceMenu';

interface Props {
  invoiceId: string;
  workspaceSlug: string;
}

export function InvoiceActions({ invoiceId, workspaceSlug }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Invoice Document Actions">
      <PrintInvoice />
      <ExportInvoiceButton />
      <ShareInvoiceMenu invoiceId={invoiceId} workspaceSlug={workspaceSlug} />
    </div>
  );
}
