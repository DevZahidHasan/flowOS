'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StaffMember } from '../types';
import { toggleStaffStatusAction } from '../actions/staff.actions';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface Props {
  staff: StaffMember;
  workspaceId: string;
}

export function StaffCard({ staff, workspaceId }: Props) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(staff.isActive);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const nextState = !isActive;
    const res = await toggleStaffStatusAction(workspaceId, staff.id, nextState);
    setLoading(false);

    if (res.error) {
      alert(res.error.message);
      return;
    }

    setIsActive(nextState);
    router.refresh();
  };

  return (
    <div className={`rounded-2xl border p-5 transition-all shadow-xl space-y-4 ${
      isActive ? 'border-white/10 bg-slate-900/80' : 'border-white/5 bg-slate-950/40 opacity-60'
    }`}>
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 font-bold text-white shadow-md text-base">
            {staff.displayName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">{staff.displayName}</h3>
            <p className="text-xs text-slate-400 font-medium">{staff.roleTitle}</p>
          </div>
        </div>

        <Switch checked={isActive} disabled={loading} onCheckedChange={handleToggle} />
      </div>

      {/* Specialties Badges */}
      {staff.specialties && staff.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {staff.specialties.map((spec) => (
            <span key={spec} className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold">
              {spec}
            </span>
          ))}
        </div>
      )}

      {/* Staff Metrics & Performance */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 text-center text-xs">
        <div>
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Commission</span>
          <span className="font-bold text-purple-300">{staff.commissionRate}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Completed</span>
          <span className="font-bold text-white">{staff.completedAppointments}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Rating</span>
          <span className="font-bold text-emerald-400">⭐ {staff.averageRating.toFixed(1)}</span>
        </div>
      </div>

      {/* Contact Footer */}
      <div className="text-[11px] text-slate-400 border-t border-white/5 pt-2 flex items-center justify-between">
        <span>{staff.phone || 'No phone'}</span>
        <span>{staff.email || 'No email'}</span>
      </div>
    </div>
  );
}
