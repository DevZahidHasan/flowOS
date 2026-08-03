import { notFound, redirect } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { CrmService } from '@/features/crm/services/crm.service';
import { CustomerList } from '@/features/crm/components/CustomerList';

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function CrmPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspaceService = new WorkspaceService();

  const workspaceRes = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspaceRes.data) {
    notFound();
  }

  const workspace = workspaceRes.data;
  const crmService = new CrmService();

  const customersRes = await crmService.getWorkspaceCustomers(workspace.id);

  if (customersRes.error && customersRes.error.code === 'MODULE_DISABLED') {
    redirect(`/${workspace.slug}/settings/modules`);
  }

  const customers = customersRes.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Customer CRM</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage customer relationship profiles, visit metrics, loyalty points, and history for <strong className="text-purple-300">{workspace.name}</strong>.
        </p>
      </div>

      <CustomerList workspaceId={workspace.id} initialCustomers={customers} />
    </div>
  );
}
