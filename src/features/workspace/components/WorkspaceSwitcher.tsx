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
          className="flex items-center justify-between w-full p-2.5 rounded-xl bg-slate-900/90 border border-white/10 hover:bg-slate-800 transition-all text-left group"
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md">
              {currentWorkspace.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">{currentWorkspace.name}</p>
              <p className="text-xs text-slate-400 capitalize truncate">{currentWorkspace.industryType}</p>
            </div>
          </div>
          <span className="text-slate-400 text-xs ml-2 group-hover:text-white transition-colors">▼</span>
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-2 w-full z-50 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-2xl space-y-1">
            <p className="px-2 py-1 text-xs font-medium text-slate-400">Workspaces</p>
            {userWorkspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/${ws.slug}`);
                }}
                className={`flex items-center w-full p-2 rounded-lg text-left text-sm transition-colors ${
                  ws.id === currentWorkspace.id
                    ? 'bg-purple-500/20 text-purple-300 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
            <div className="border-t border-white/10 pt-1 mt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="flex items-center space-x-2 w-full p-2 rounded-lg text-left text-xs font-semibold text-purple-400 hover:bg-purple-500/10 transition-colors"
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
