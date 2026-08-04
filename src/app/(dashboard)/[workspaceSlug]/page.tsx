import { notFound } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function DashboardPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspaceService = new WorkspaceService();

  const workspaceRes = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspaceRes.data) {
    notFound();
  }

  const workspace = workspaceRes.data;
  const modulesRes = await workspaceService.getWorkspaceModules(workspace.id);
  const modules = modulesRes.data || [];
  const enabledCount = modules.filter((m) => m.isEnabled).length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl border bg-card p-8 shadow-sm">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary border border-primary/20">
            <span>Industry Profile</span>
            <span className="font-bold">• {workspace.industryType}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">
            Overview Dashboard <span className="text-muted-foreground font-normal text-xl ml-2">{workspace.name}</span>
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            FlowOS is active. You have <strong className="text-foreground">{enabledCount} modules</strong> currently enabled for your business operations.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Online</div>
            <p className="text-xs text-muted-foreground mt-1">Multi-tenant RLS Protected</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Modules</CardTitle>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <span className="text-[10px]">🧩</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{enabledCount} Active</div>
            <p className="text-xs text-muted-foreground mt-1">Configured for {workspace.industryType}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Security Layer</CardTitle>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
              <span className="text-[10px]">🛡️</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Isolated</div>
            <p className="text-xs text-muted-foreground mt-1">Workspace ID: {workspace.id.substring(0, 8)}...</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Engine</CardTitle>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
              <span className="text-[10px]">🤖</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Ready</div>
            <p className="text-xs text-muted-foreground mt-1">Groq Llama-3.3</p>
          </CardContent>
        </Card>
      </div>

      {/* Enabled Modules Quick Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Enabled Modules</h2>
          <Link
            href={`/${workspace.slug}/settings/modules`}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Manage Modules →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {modules.map((m) => (
            <Card
              key={m.id}
              className={`transition-all shadow-sm ${
                m.isEnabled ? 'hover:border-primary/50' : 'opacity-40 bg-muted/50'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold capitalize">
                  {m.moduleKey.replace('_', ' ')}
                </CardTitle>
                <Badge variant={m.isEnabled ? 'secondary' : 'outline'}>
                  {m.isEnabled ? 'Active' : 'Disabled'}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  {m.isEnabled ? 'Module fully enabled and ready for operations.' : 'Module disabled in settings.'}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
