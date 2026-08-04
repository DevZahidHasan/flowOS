import { notFound, redirect } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { ServicesService } from '@/features/services/services/services.service';
import { ServiceList } from '@/features/services/components/ServiceList';

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function ServicesPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspaceService = new WorkspaceService();

  const workspaceRes = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspaceRes.data) {
    notFound();
  }

  const workspace = workspaceRes.data;
  const servicesService = new ServicesService();

  const servicesRes = await servicesService.getWorkspaceServices(workspace.id);

  if (servicesRes.error && servicesRes.error.code === 'MODULE_DISABLED') {
    redirect(`/${workspace.slug}/settings/modules`);
  }

  const services = servicesRes.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Services Catalog</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure business services, pricing tiers, and durations for <strong className="text-primary font-semibold">{workspace.name}</strong>.
        </p>
      </div>

      <ServiceList workspaceId={workspace.id} initialServices={services} />
    </div>
  );
}
