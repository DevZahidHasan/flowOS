'use client';

import { logoutAction } from '@/features/auth/actions/auth.actions';
import { useRouter } from 'next/navigation';
import { UserProfile, Workspace } from '@/types/global';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
    <header className="h-16 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileMenu}
          aria-label="Open navigation menu"
          className="md:hidden flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 border border-white/10 text-slate-300 active:bg-slate-800"
        >
          <span className="text-xl">☰</span>
        </button>
        <div>
          <h1 className="text-base md:text-lg font-bold text-white tracking-tight truncate max-w-[160px] sm:max-w-xs">
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

      <div className="flex items-center space-x-4">
        {profile && (
          <div className="flex items-center space-x-3 pl-3 border-l border-white/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
              {profile.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-white leading-none">{profile.fullName}</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{profile.email}</p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs"
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
}
