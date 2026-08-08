import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function RootPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let provisioningError: string | null = null;

  if (user) {
    const workspaceService = new WorkspaceService();
    const workspacesRes = await workspaceService.getUserWorkspaces(user.id);

    if (workspacesRes.data && workspacesRes.data.length > 0) {
      redirect(`/${workspacesRes.data[0].slug}`);
    } else {
      // Auto-provision default workspace for user
      const defaultName = (user.user_metadata?.full_name as string) ? `${user.user_metadata.full_name}'s Workspace` : 'My Business';
      const generatedSlug = defaultName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'my-workspace';
      const createdRes = await workspaceService.createWorkspace(user.id, {
        name: defaultName,
        slug: `${generatedSlug}-${Date.now().toString().slice(-4)}`,
        industryType: 'General',
      });
      
      if (createdRes.data) {
        redirect(`/${createdRes.data.slug}`);
      } else {
        provisioningError = createdRes.error?.message || 'Failed to auto-provision your workspace. Please contact support.';
      }
    }
  }

  // If user is logged in but we reached here, it means workspace provisioning failed
  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-100/30 via-slate-50 to-slate-50 pointer-events-none" />
        <div className="relative z-10 max-w-xl space-y-6">
          <h1 className="text-3xl font-bold text-slate-900">Setup Incomplete</h1>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {provisioningError}
          </div>
          <p className="text-slate-600">
            We encountered an issue while setting up your default workspace. 
            This might be due to database permissions or missing setup steps.
          </p>
          <div className="pt-4 flex gap-4 justify-center">
            <Link href="/login">
              <Button variant="outline">Try Again</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-100/40 via-slate-50 to-slate-50 pointer-events-none" />
      <div className="relative z-10 max-w-3xl space-y-6">
        <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm text-emerald-700 backdrop-blur-md shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>FlowOS 1.0 Commercial Operating System</span>
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900">
          The AI-Powered <span className="gradient-text">Business Operating System</span>
        </h1>
        
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Run your entire operation from one modular system. Turn on only the modules your business needs—from appointments to queue management, staff scheduling, and AI automations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto px-8 text-base shadow-sm">
              Get Started Free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 text-base bg-white shadow-sm">
              Sign In to Workspace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
