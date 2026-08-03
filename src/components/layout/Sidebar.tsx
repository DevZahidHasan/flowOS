'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Workspace, WorkspaceModule, ModuleKey } from '@/types/global';
import { WorkspaceSwitcher } from '@/features/workspace/components/WorkspaceSwitcher';

interface Props {
  currentWorkspace: Workspace;
  userWorkspaces: Workspace[];
  modules: WorkspaceModule[];
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: { moduleKey: ModuleKey; label: string; href: string; icon: string }[] = [
  { moduleKey: 'appointments', label: 'Appointments', href: '/appointments', icon: '📅' },
  { moduleKey: 'queue', label: 'Queue Display', href: '/queue', icon: '🎟️' },
  { moduleKey: 'crm', label: 'Customers', href: '/crm', icon: '👥' },
  { moduleKey: 'services', label: 'Services', href: '/services', icon: '💼' },
  { moduleKey: 'staff', label: 'Staff Roster', href: '/staff', icon: '👨‍💼' },
  { moduleKey: 'projects', label: 'Projects & Tasks', href: '/projects', icon: '📊' },
  { moduleKey: 'invoices', label: 'Invoices & Billing', href: '/invoices', icon: '💳' },
  { moduleKey: 'courses', label: 'Courses & LMS', href: '/courses', icon: '🎓' },
  { moduleKey: 'office', label: 'Office & Rooms', href: '/office', icon: '🏢' },
  { moduleKey: 'inventory', label: 'Inventory', href: '/inventory', icon: '📦' },
  { moduleKey: 'reports', label: 'Analytics Reports', href: '/reports', icon: '📈' },
  { moduleKey: 'ai', label: 'AI Assistant', href: '/ai', icon: '🤖' },
];

export function Sidebar({
  currentWorkspace,
  userWorkspaces,
  modules,
  isOpenMobile,
  onCloseMobile,
}: Props) {
  const pathname = usePathname();

  const enabledKeys = new Set(
    modules.filter((m) => m.isEnabled).map((m) => m.moduleKey)
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Responsive Sidebar & Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 md:w-64 shrink-0 flex flex-col border-r border-white/10 bg-slate-950/95 backdrop-blur-xl h-screen transition-transform duration-300 md:static md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Workspace Switcher Header */}
        <div className="p-4 border-b border-white/10 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 font-bold text-white shadow-lg shadow-purple-500/30">
                F
              </div>
              <span className="text-xl font-bold gradient-text tracking-wide">FlowOS</span>
            </div>
            {/* Close Button on Mobile Drawer */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              ✕
            </button>
          </div>
          <WorkspaceSwitcher currentWorkspace={currentWorkspace} userWorkspaces={userWorkspaces} />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <Link
            href={`/${currentWorkspace.slug}`}
            onClick={onCloseMobile}
            className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
              pathname === `/${currentWorkspace.slug}`
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-lg">⚡</span>
            <span>Overview</span>
          </Link>

          <div className="pt-3 pb-1 px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Enabled Modules
          </div>

          {NAV_ITEMS.map((item) => {
            if (!enabledKeys.has(item.moduleKey)) return null;

            const targetHref = `/${currentWorkspace.slug}${item.href}`;
            const isActive = pathname.startsWith(targetHref);

            return (
              <Link
                key={item.moduleKey}
                href={targetHref}
                onClick={onCloseMobile}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 pb-1 px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Administration
          </div>
          <Link
            href={`/${currentWorkspace.slug}/settings/modules`}
            onClick={onCloseMobile}
            className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
              pathname.includes('/settings/modules')
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-lg">⚙️</span>
            <span>Module Store</span>
          </Link>
        </nav>

        {/* Footer User Info */}
        <div className="p-4 border-t border-white/10 text-xs text-slate-500 flex items-center justify-between">
          <span>FlowOS Mobile v1.0</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </aside>

      {/* Mobile One-Thumb Bottom Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 flex md:hidden h-16 items-center justify-around px-2">
        <Link
          href={`/${currentWorkspace.slug}`}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-xs ${
            pathname === `/${currentWorkspace.slug}` ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">⚡</span>
          <span className="text-[10px]">Home</span>
        </Link>

        <Link
          href={`/${currentWorkspace.slug}/settings/modules`}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-xs ${
            pathname.includes('/settings/modules') ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">⚙️</span>
          <span className="text-[10px]">Store</span>
        </Link>

        <button
          onClick={onCloseMobile}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-xs text-slate-400"
        >
          <span className="text-lg">☰</span>
          <span className="text-[10px]">Menu</span>
        </button>
      </div>
    </>
  );
}
