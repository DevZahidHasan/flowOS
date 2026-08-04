'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Appointment, AppointmentStatus } from '../types';
import { updateAppointmentStatusAction } from '../actions/appointments.actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  SCHEDULED: { label: 'Scheduled', variant: 'default' },
  IN_PROGRESS: { label: 'In Progress', variant: 'outline' },
  COMPLETED: { label: 'Completed', variant: 'secondary' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  NO_SHOW: { label: 'No-Show', variant: 'destructive' },
};

interface Props {
  appointment: Appointment;
  workspaceId: string;
}

export function AppointmentCard({ appointment, workspaceId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
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
      toast({
        title: 'Status Update Failed',
        description: res.error.message,
        variant: 'destructive',
      });
      return;
    }

    router.refresh();
  };

  const startDate = new Date(appointment.startTime);
  const formattedTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = startDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  const statusMeta = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.SCHEDULED;

  return (
    <Card className="flex flex-col justify-between hover:border-primary/40 transition-all duration-300 shadow-md bg-card/60 backdrop-blur-md border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold tracking-tight">{appointment.customerName}</h3>
              {appointment.isWalkIn && (
                <Badge variant="outline" className="text-[10px]">
                  Walk-In
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium">{appointment.serviceName}</p>
          </div>

          <Badge variant={statusMeta.variant} className="text-[10px] uppercase font-semibold">
            {statusMeta.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        {/* Details Row */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-muted/50 p-3 rounded-md">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold tracking-wider">Date & Time</span>
            <span className="font-medium text-foreground">{formattedDate}</span>
            <span className="block text-muted-foreground">{formattedTime}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold tracking-wider">Assigned Staff</span>
            <span className="font-medium text-foreground truncate block">{appointment.staffName}</span>
            <span className="block text-muted-foreground">{appointment.customerPhone || 'No phone'}</span>
          </div>
        </div>

        {/* Notes if any */}
        {appointment.notes && (
          <p className="text-xs text-muted-foreground italic bg-muted/30 px-3 py-2 rounded-md border">
            &quot;{appointment.notes}&quot;
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex w-full items-center space-x-2 pt-4 border-t">
          {appointment.status === 'SCHEDULED' && (
            <>
              <Button
                size="sm"
                variant="default"
                disabled={loading}
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="flex-1 text-xs"
              >
                Start Session
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => handleStatusChange('CANCELLED')}
                className="text-xs text-destructive hover:bg-destructive/10"
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
              className="w-full text-xs font-semibold"
            >
              Mark Completed ✓
            </Button>
          )}

          {(appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') && (
            <span className="text-[11px] text-muted-foreground font-medium italic mx-auto py-1">
              Status updated to {appointment.status.toLowerCase()}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
