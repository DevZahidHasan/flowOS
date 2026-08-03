'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Appointment, AppointmentStatus } from '../types';
import { updateAppointmentStatusAction } from '../actions/appointments.actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; variant: 'default' | 'success' | 'destructive' | 'outline' }> = {
  SCHEDULED: { label: 'Scheduled', variant: 'default' },
  IN_PROGRESS: { label: 'In Progress', variant: 'outline' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  NO_SHOW: { label: 'No-Show', variant: 'destructive' },
};

interface Props {
  appointment: Appointment;
  workspaceId: string;
}

export function AppointmentCard({ appointment, workspaceId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    setLoading(true);
    const res = await updateAppointmentStatusAction({
      workspaceId,
      appointmentId: appointment.id,
      status: newStatus,
    });
    setLoading(false);

    if (res.error) {
      alert(res.error.message);
      return;
    }

    router.refresh();
  };

  const startDate = new Date(appointment.startTime);
  const formattedTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = startDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  const statusMeta = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.SCHEDULED;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-5 shadow-xl transition-all hover:border-purple-500/30 flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-white text-base tracking-tight">{appointment.customerName}</h3>
            {appointment.isWalkIn && (
              <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-300 border-purple-500/30">
                Walk-In
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium">{appointment.serviceName}</p>
        </div>

        <Badge variant={statusMeta.variant} className="text-xs uppercase font-semibold">
          {statusMeta.label}
        </Badge>
      </div>

      {/* Details Row */}
      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-white/5 text-slate-300">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Date & Time</span>
          <span className="font-semibold text-white">{formattedDate}</span>
          <span className="block text-slate-400">{formattedTime}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Assigned Staff</span>
          <span className="font-semibold text-white truncate block">{appointment.staffName}</span>
          <span className="block text-slate-400">{appointment.customerPhone || 'No phone'}</span>
        </div>
      </div>

      {/* Notes if any */}
      {appointment.notes && (
        <p className="text-xs text-slate-400 italic bg-slate-950/30 px-3 py-1.5 rounded-lg border border-white/5">
          &quot;{appointment.notes}&quot;
        </p>
      )}

      {/* Action Buttons for Mobile & Desktop Touch */}
      <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
        {appointment.status === 'SCHEDULED' && (
          <>
            <Button
              size="sm"
              variant="default"
              disabled={loading}
              onClick={() => handleStatusChange('IN_PROGRESS')}
              className="flex-1 min-h-[44px] text-xs font-semibold"
            >
              Start Session
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => handleStatusChange('CANCELLED')}
              className="min-h-[44px] text-xs text-red-400 hover:bg-red-500/10"
            >
              Cancel
            </Button>
          </>
        )}

        {appointment.status === 'IN_PROGRESS' && (
          <Button
            size="sm"
            variant="default"
            disabled={loading}
            onClick={() => handleStatusChange('COMPLETED')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white min-h-[44px] text-xs font-semibold"
          >
            Mark Completed ✓
          </Button>
        )}

        {(appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') && (
          <span className="text-[11px] text-slate-500 font-medium italic mx-auto py-1">
            Status updated to {appointment.status.toLowerCase()}
          </span>
        )}
      </div>
    </div>
  );
}
