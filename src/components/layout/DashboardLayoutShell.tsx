'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Workspace, WorkspaceModule, UserProfile } from '@/types/global';

interface Props {
  currentWorkspace: Workspace;
  userWorkspaces: Workspace[];
  modules: WorkspaceModule[];
  profile: UserProfile | null;
  children: React.ReactNode;
}

export function DashboardLayoutShell({
  currentWorkspace,
  userWorkspaces,
  modules,
  profile,
  children,
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-purple-500 selection:text-white">
      <Sidebar
        currentWorkspace={currentWorkspace}
        userWorkspaces={userWorkspaces}
        modules={modules}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Header
          currentWorkspace={currentWorkspace}
          profile={profile}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
