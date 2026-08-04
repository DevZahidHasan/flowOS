'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Workspace } from '@/types/global';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

interface Props {
  currentWorkspace: Workspace;
  userWorkspaces: Workspace[];
}

export function WorkspaceSwitcher({ currentWorkspace, userWorkspaces }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full p-2.5 rounded-xl bg-card border hover:bg-muted/50 transition-all text-left group shadow-sm"
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
              {currentWorkspace.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-foreground truncate">{currentWorkspace.name}</p>
              <p className="text-xs text-muted-foreground capitalize truncate">{currentWorkspace.industryType}</p>
            </div>
          </div>
          <span className="text-muted-foreground text-xs ml-2 group-hover:text-foreground transition-colors">▼</span>
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-2 w-full z-50 rounded-xl border bg-popover text-popover-foreground p-2 shadow-md space-y-1">
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Workspaces</p>
            {userWorkspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/${ws.slug}`);
                }}
                className={`flex items-center w-full p-2 rounded-lg text-left text-sm transition-colors ${
                  ws.id === currentWorkspace.id
                    ? 'bg-secondary text-secondary-foreground font-semibold'
                    : 'hover:bg-muted'
                }`}
              >
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
            <div className="border-t pt-1 mt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="flex items-center space-x-2 w-full p-2 rounded-lg text-left text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                <span>+</span>
                <span>Create Workspace</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateWorkspaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
