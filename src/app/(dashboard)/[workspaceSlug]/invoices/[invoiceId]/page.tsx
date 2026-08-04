import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { InvoiceService } from '@/features/invoices/services/invoice.service';
import { PaymentService } from '@/features/payments/services/payment.service';
import { CrmRepository } from '@/features/crm/repositories/crm.repository';
import { InvoiceHeader } from '@/features/invoices/components/InvoiceHeader';
import { InvoiceTabs } from '@/features/invoices/components/InvoiceTabs';
import { InvoiceOverview } from '@/features/invoices/components/InvoiceOverview';
import { InvoiceLineItemsTable } from '@/features/invoices/components/InvoiceLineItemsTable';
import { InvoiceActivityTimeline } from '@/features/invoices/components/InvoiceActivityTimeline';
import { InvoiceNotes } from '@/features/invoices/components/InvoiceNotes';
import { InvoiceCustomerCard } from '@/features/invoices/components/InvoiceCustomerCard';
import { InvoicePaymentSummary } from '@/features/invoices/components/InvoicePaymentSummary';
import { InvoiceStatusHistory } from '@/features/invoices/components/InvoiceStatusHistory';
import { InvoiceSkeleton } from '@/features/invoices/components/InvoiceSkeleton';
import { PaymentSummaryCards } from '@/features/payments/components/PaymentSummaryCards';
import { PaymentList } from '@/features/payments/components/PaymentList';
import type { InvoicePaymentSummary as PaymentSummaryType } from '@/features/payments/types';
import type { InvoiceStatus } from '@/features/invoices/types';

interface Props {
  params: Promise<{ workspaceSlug: string; invoiceId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const VALID_TABS = ['overview', 'line-items', 'activity', 'notes', 'payments'] as const;
type ValidTab = (typeof VALID_TABS)[number];

function isValidTab(tab: string | undefined): tab is ValidTab {
  return VALID_TABS.includes(tab as ValidTab);
}

function AttachmentsPlaceholder() {
  return (
    <div className="rounded-lg border border-dashed bg-card p-12 text-center">
      <div className="text-4xl mb-3" aria-hidden="true">📎</div>
      <h3 className="text-base font-semibold text-foreground">Attachments</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
        Upload invoices, receipts, and supporting documents. Attachments will be available in a future update.
      </p>
    </div>
  );
}

function InvoiceNotFound({ workspaceSlug }: { workspaceSlug: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
      <div className="text-6xl" aria-hidden="true">🧾</div>
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-foreground">Invoice Not Found</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          This invoice may have been deleted or you may not have permission to view it.
        </p>
      </div>
      <a href={`/${workspaceSlug}/invoices`} className="text-sm text-primary hover:underline">
        ← Back to Invoices
      </a>
    </div>
  );
}

export default async function InvoiceWorkspacePage({ params, searchParams }: Props) {
  const { workspaceSlug, invoiceId } = await params;
  const sp = await searchParams;
  const activeTab: ValidTab = isValidTab(sp.tab) ? sp.tab : 'overview';

  // ── 1. Resolve Workspace ────────────────────────────────────────
  const workspaceService = new WorkspaceService();
  const workspaceRes = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspaceRes.data) notFound();
  const workspace = workspaceRes.data;

  // ── 2. Load Invoice (with line items) ──────────────────────────
  const invoiceRes = await InvoiceService.getInvoice(workspace.id, invoiceId);
  if (invoiceRes.error || !invoiceRes.data) {
    return <InvoiceNotFound workspaceSlug={workspaceSlug} />;
  }
  const invoice = invoiceRes.data;

  // ── 3. Load Payment Summary (source of truth for balances) ─────
  const paymentRes = await PaymentService.getInvoicePayments(workspace.id, invoiceId);
  const paymentSummary: PaymentSummaryType = paymentRes.data ?? {
    invoiceTotal:  Number(invoice.total_amount),
    totalPaid:     0,
    outstanding:   Number(invoice.total_amount),
    payments:      [],
  };

  // ── 4. Load Customer Details ────────────────────────────────────
  const crmRepo = new CrmRepository();
  const customerRes = await crmRepo.getCustomerDetails(workspace.id, invoice.customer_id);
  const customer = customerRes.data?.customer;

  // ── 5. Compute effective status for display ─────────────────────
  const isOverdue = invoice.status === 'SENT' && new Date(invoice.due_date) < new Date();
  const effectiveStatus: InvoiceStatus = isOverdue ? 'OVERDUE' : (invoice.status as InvoiceStatus);

  return (
    <div className="space-y-6">
      <title>{`${invoice.invoice_number} — Invoices — FlowOS`}</title>

      {/* Header */}
      <InvoiceHeader
        invoice={invoice}
        customerName={customer?.fullName ?? 'Unknown Customer'}
        workspaceSlug={workspaceSlug}
        workspaceId={workspace.id}
        paymentSummary={paymentSummary}
      />

      {/* Tabs */}
      <Suspense fallback={null}>
        <InvoiceTabs activeTab={activeTab} />
      </Suspense>

      {/* Main 2-column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── Left: Tab Content ── */}
        <div className="lg:col-span-2">
          <Suspense fallback={<InvoiceSkeleton />}>
            {activeTab === 'overview' && (
              <InvoiceOverview
                invoice={invoice}
                customerName={customer?.fullName ?? 'Unknown Customer'}
                customerEmail={customer?.email ?? null}
              />
            )}
            {activeTab === 'line-items' && (
              <InvoiceLineItemsTable items={invoice.items} currency={invoice.currency} />
            )}
            {activeTab === 'activity' && (
              <InvoiceActivityTimeline invoice={invoice} payments={paymentSummary.payments} />
            )}
            {activeTab === 'notes' && <InvoiceNotes invoice={invoice} />}
            {activeTab === 'payments' && (
              <div className="space-y-5" role="tabpanel" id="tabpanel-payments">
                {/* Summary Cards */}
                <PaymentSummaryCards
                  summary={paymentSummary}
                  currency={invoice.currency}
                  invoiceStatus={effectiveStatus}
                />
                {/* Payment Records */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                    Payment Records
                  </h3>
                  <PaymentList
                    payments={paymentSummary.payments}
                    workspaceId={workspace.id}
                    currency={invoice.currency}
                    invoiceStatus={invoice.status}
                  />
                </div>
              </div>
            )}
            {sp.tab === 'attachments' && <AttachmentsPlaceholder />}
          </Suspense>
        </div>

        {/* ── Right: Sidebar ── */}
        <aside className="space-y-4" aria-label="Invoice sidebar">
          {customer && (
            <InvoiceCustomerCard customer={customer} workspaceSlug={workspaceSlug} />
          )}
          <InvoicePaymentSummary invoice={invoice} summary={paymentSummary} />
          <InvoiceStatusHistory invoice={invoice} />
        </aside>
      </div>
    </div>
  );
}
