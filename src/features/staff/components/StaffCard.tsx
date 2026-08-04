'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(staff.isActive);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const nextState = !isActive;
    const res = await toggleStaffStatusAction(workspaceId, staff.id, nextState);
    setLoading(false);

    if (res.error) {
      toast({
        title: 'Status Toggle Failed',
        description: res.error.message,
        variant: 'destructive',
      });
      return;
    }

    setIsActive(nextState);
    router.refresh();
  };

  return (
    <div className={`rounded-2xl border p-5 transition-all shadow-xl space-y-4 ${
      isActive ? 'bg-card text-card-foreground' : 'opacity-60 bg-muted/40'
    }`}>
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 font-bold text-white shadow-md text-base">
            {staff.displayName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base tracking-tight">{staff.displayName}</h3>
            <p className="text-xs text-muted-foreground font-medium">{staff.roleTitle}</p>
          </div>
        </div>

        <Switch checked={isActive} disabled={loading} onCheckedChange={handleToggle} />
      </div>

      {/* Specialties Badges */}
      {staff.specialties && staff.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {staff.specialties.map((spec) => (
            <span key={spec} className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border text-[10px] font-semibold">
              {spec}
            </span>
          ))}
        </div>
      )}

      {/* Staff Metrics & Performance */}
      <div className="grid grid-cols-3 gap-2 bg-muted/50 p-2.5 rounded-xl border text-center text-xs text-muted-foreground">
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Commission</span>
          <span className="font-bold text-foreground">{staff.commissionRate}%</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Completed</span>
          <span className="font-bold text-foreground">{staff.completedAppointments}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Rating</span>
          <span className="font-bold text-emerald-500 dark:text-emerald-400">⭐ {staff.averageRating.toFixed(1)}</span>
        </div>
      </div>

      {/* Contact Footer */}
      <div className="text-[11px] text-muted-foreground border-t pt-2 flex items-center justify-between">
        <span>{staff.phone || 'No phone'}</span>
        <span>{staff.email || 'No email'}</span>
      </div>
    </div>
  );
}
