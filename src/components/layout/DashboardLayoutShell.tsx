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
    <div className="flex min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Skip to Main Content — visible on focus only */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-semibold focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      <Sidebar
        currentWorkspace={currentWorkspace}
        userWorkspaces={userWorkspaces}
        modules={modules}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Header
          currentWorkspace={currentWorkspace}
          profile={profile}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main id="main-content" className="flex-1 p-4 md:p-8 overflow-y-auto" role="main">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
