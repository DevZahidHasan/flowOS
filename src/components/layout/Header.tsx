'use client';

import { logoutAction } from '@/features/auth/actions/auth.actions';
import { useRouter } from 'next/navigation';
import { UserProfile, Workspace } from '@/types/global';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

interface Props {
  currentWorkspace: Workspace;
  profile: UserProfile | null;
  onToggleMobileMenu?: () => void;
}

export function Header({ currentWorkspace, profile, onToggleMobileMenu }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileMenu}
          aria-label="Open navigation menu"
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-md border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <span className="text-xl" aria-hidden="true">☰</span>
        </button>
        <div>
          <h1 className="text-base md:text-lg font-bold text-foreground tracking-tight truncate max-w-[160px] sm:max-w-xs">
            {currentWorkspace.name}
          </h1>
          <Badge variant="default" className="text-[10px] uppercase tracking-wider md:hidden">
            {currentWorkspace.industryType}
          </Badge>
        </div>
        <Badge variant="default" className="text-[11px] uppercase tracking-wider hidden md:inline-flex">
          {currentWorkspace.industryType}
        </Badge>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <ThemeToggle />
        
        {profile && (
          <div className="flex items-center space-x-3 pl-3 border-l">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-bold text-xs" aria-hidden="true">
              {profile.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-foreground leading-none">{profile.fullName}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{profile.email}</p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs"
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
}
