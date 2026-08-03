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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/60 via-slate-900 to-slate-900 p-8 border border-purple-500/20 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300 border border-purple-500/30">
            <span>Industry Profile</span>
            <span className="font-bold">• {workspace.industryType}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome to <span className="gradient-text">{workspace.name}</span>
          </h1>
          <p className="text-slate-300 max-w-xl text-sm">
            FlowOS is active. You have <strong className="text-purple-300">{enabledCount} modules</strong> currently enabled for your business operations.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-400">Operating System Status</CardTitle>
            <span className="text-emerald-400 text-xs">● Active</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Online</div>
            <p className="text-xs text-slate-500 mt-1">Multi-tenant RLS Protected</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-400">Active Modules</CardTitle>
            <span className="text-purple-400 text-xs">🧩 {enabledCount}/12</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{enabledCount} Active</div>
            <p className="text-xs text-slate-500 mt-1">Configured for {workspace.industryType}</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-400">Security Layer</CardTitle>
            <span className="text-blue-400 text-xs">🛡️ RLS On</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Isolated</div>
            <p className="text-xs text-slate-500 mt-1">Workspace ID: {workspace.id.substring(0, 8)}...</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-400">AI Assistance Engine</CardTitle>
            <span className="text-purple-400 text-xs">Groq Llama-3.3</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Ready</div>
            <p className="text-xs text-slate-500 mt-1">Provider-Agnostic Interface</p>
          </CardContent>
        </Card>
      </div>

      {/* Enabled Modules Quick Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Enabled Modules Quick Access</h2>
          <Link
            href={`/${workspace.slug}/settings/modules`}
            className="text-xs font-semibold text-purple-400 hover:underline"
          >
            Manage Modules in Store →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {modules.map((m) => (
            <Card
              key={m.id}
              className={`border-white/10 transition-all ${
                m.isEnabled ? 'bg-slate-900/80 hover:border-purple-500/50' : 'bg-slate-950/40 opacity-40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold capitalize">
                  {m.moduleKey.replace('_', ' ')}
                </CardTitle>
                <Badge variant={m.isEnabled ? 'success' : 'outline'}>
                  {m.isEnabled ? 'Active' : 'Disabled'}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs text-slate-400 mt-1">
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
