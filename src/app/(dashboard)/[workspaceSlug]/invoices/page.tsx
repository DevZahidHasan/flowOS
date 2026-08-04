import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { getInvoicesAction } from '@/features/invoices/actions/invoice.actions';
import { InvoiceToolbar } from '@/features/invoices/components/InvoiceToolbar';
import { InvoiceFilters } from '@/features/invoices/components/InvoiceFilters';
import { EmptyInvoices } from '@/features/invoices/components/EmptyInvoices';
import { InvoiceListClient } from './InvoiceListClient';

interface Props {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function InvoicesPage({ params, searchParams }: Props) {
  const { workspaceSlug } = await params;
  const sp = await searchParams;
  
  const workspaceService = new WorkspaceService();
  const workspaceRes = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  
  if (!workspaceRes.data) {
    notFound();
  }
  const workspace = workspaceRes.data;

  // Verify the invoices module is enabled
  const modulesRes = await workspaceService.getWorkspaceModules(workspace.id);
  const modules = modulesRes.data || [];
  const invoicesModule = modules.find(m => m.moduleKey === 'invoices');
  
  if (!invoicesModule || !invoicesModule.isEnabled) {
    redirect(`/${workspace.slug}?error=invoices_module_disabled`);
  }

  // Parse search parameters
  const page = parseInt(sp.page || '1', 10);
  const limit = 20; // In a real app, this could be configurable
  const search = sp.q || undefined;
  const status = sp.status || undefined;
  const sortParam = sp.sort || 'created_at:desc';
  const [sortBy, sortOrder] = sortParam.split(':') as [string, 'asc' | 'desc'];

  // Fetch Invoices
  const invoicesRes = await getInvoicesAction({
    workspaceId: workspace.id,
    page,
    limit,
    search,
    status,
    sortBy,
    sortOrder
  });

  const invoices = invoicesRes.data?.data || [];
  const count = invoicesRes.data?.count || 0;
  const totalPages = Math.ceil(count / limit);

  // For the Empty State, we want to know if it's truly empty or just filtered empty.
  const isSearchActive = !!search || !!status;
  const isEmpty = invoices.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and track your business billing.</p>
        </div>
        <Button asChild className="w-full sm:w-auto shadow-sm">
          <Link href={`/${workspace.slug}/invoices/new`}>
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Link>
        </Button>
      </div>

      <InvoiceToolbar 
        filters={<InvoiceFilters />}
      />

      {isEmpty ? (
        <EmptyInvoices workspaceSlug={workspace.slug} isSearch={isSearchActive} />
      ) : (
        <div className="space-y-4">
          <InvoiceListClient 
            workspaceId={workspace.id}
            workspaceSlug={workspace.slug}
            invoices={invoices as any} 
          />

          {/* Simple Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, count)} of {count} entries
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page <= 1}
                  asChild
                >
                  <Link href={`?page=${page - 1}&q=${search || ''}&status=${status || ''}&sort=${sortParam}`}>
                    Previous
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page >= totalPages}
                  asChild
                >
                  <Link href={`?page=${page + 1}&q=${search || ''}&status=${status || ''}&sort=${sortParam}`}>
                    Next
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
