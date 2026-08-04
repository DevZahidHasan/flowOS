import { notFound } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { CrmRepository } from '@/features/crm/repositories/crm.repository';
import { ServicesRepository } from '@/features/services/repositories/services.repository';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { NewInvoiceClientWrapper } from './NewInvoiceClientWrapper';

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function NewInvoicePage({ params }: Props) {
  const { workspaceSlug } = await params;
  
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

  // Fetch Customers & Services in parallel
  const crmRepo = new CrmRepository();
  const servicesRepo = new ServicesRepository();

  const [customersRes, servicesRes] = await Promise.all([
    crmRepo.getWorkspaceCustomers(workspace.id),
    servicesRepo.getWorkspaceServices(workspace.id)
  ]);

  const customers = customersRes.data || [];
  const services = servicesRes.data || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center space-x-4">
        <Link 
          href={`/${workspace.slug}`}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Create Invoice</h1>
          <p className="text-muted-foreground text-sm mt-1">Draft a new invoice for a customer.</p>
        </div>
      </div>

      <div className="bg-background rounded-xl">
        <NewInvoiceClientWrapper 
          workspaceId={workspace.id}
          workspaceSlug={workspace.slug}
          customers={customers}
          services={services}
        />
      </div>
    </div>
  );
}
