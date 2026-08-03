import { notFound, redirect } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { AppointmentsService } from '@/features/appointments/services/appointments.service';
import { AppointmentCalendar } from '@/features/appointments/components/AppointmentCalendar';

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function AppointmentsPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspaceService = new WorkspaceService();

  const workspaceRes = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspaceRes.data) {
    notFound();
  }

  const workspace = workspaceRes.data;
  const appointmentsService = new AppointmentsService();

  const [appointmentsRes, servicesRes] = await Promise.all([
    appointmentsService.getWorkspaceAppointments(workspace.id),
    appointmentsService.getWorkspaceServices(workspace.id),
  ]);

  if (appointmentsRes.error && appointmentsRes.error.code === 'MODULE_DISABLED') {
    redirect(`/${workspace.slug}/settings/modules`);
  }

  const appointments = appointmentsRes.data || [];
  const services = servicesRes.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Appointments & Scheduling</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage bookings, recurring slots, and quick walk-in appointments for <strong className="text-purple-300">{workspace.name}</strong>.
        </p>
      </div>

      <AppointmentCalendar
        workspaceId={workspace.id}
        initialAppointments={appointments}
        services={services}
      />
    </div>
  );
}
