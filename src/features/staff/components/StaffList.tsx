'use client';

import { useState } from 'react';
import { StaffMember } from '../types';
import { StaffCard } from './StaffCard';
import { CreateStaffSheet } from './CreateStaffSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  workspaceId: string;
  initialStaff: StaffMember[];
}

export function StaffList({ workspaceId, initialStaff }: Props) {
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filtered = initialStaff.filter((s) => {
    const matchesSearch =
      s.displayName.toLowerCase().includes(search.toLowerCase()) ||
      s.roleTitle.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterActive === 'ACTIVE') return s.isActive;
    if (filterActive === 'INACTIVE') return !s.isActive;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterActive('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[44px] transition-colors ${
              filterActive === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-950/60 text-slate-400 hover:text-white'
            }`}
          >
            All Staff ({initialStaff.length})
          </button>
          <button
            onClick={() => setFilterActive('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[44px] transition-colors ${
              filterActive === 'ACTIVE' ? 'bg-purple-600 text-white' : 'bg-slate-950/60 text-slate-400 hover:text-white'
            }`}
          >
            Active Roster
          </button>
          <button
            onClick={() => setFilterActive('INACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[44px] transition-colors ${
              filterActive === 'INACTIVE' ? 'bg-purple-600 text-white' : 'bg-slate-950/60 text-slate-400 hover:text-white'
            }`}
          >
            Inactive / On Leave
          </button>
        </div>

        <Button onClick={() => setIsSheetOpen(true)} className="min-h-[44px] font-semibold flex-1 sm:flex-none">
          + Add Staff Member
        </Button>
      </div>

      {/* Search Input */}
      <Input
        placeholder="Search staff by name or job title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-slate-900/60 border-white/10"
      />

      {/* Staff Grid */}
      {filtered.length === 0 ? (
        <div className="text-center p-12 rounded-2xl border border-white/10 bg-slate-900/40 space-y-3">
          <span className="text-4xl">👨‍💼</span>
          <h3 className="text-lg font-semibold text-white">No staff members found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            No team members match your search criteria. Add staff members to manage rosters and commissions.
          </p>
          <Button onClick={() => setIsSheetOpen(true)} size="sm" className="min-h-[44px]">
            + Add Staff Member
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((staff) => (
            <StaffCard key={staff.id} staff={staff} workspaceId={workspaceId} />
          ))}
        </div>
      )}

      {/* Create Staff Bottom Sheet Modal */}
      <CreateStaffSheet
        workspaceId={workspaceId}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
