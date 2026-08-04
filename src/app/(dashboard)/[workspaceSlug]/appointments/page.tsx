import { notFound, redirect } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { AppointmentsService } from '@/features/appointments/services/appointments.service';
import { AppointmentCalendar } from '@/features/appointments/components/AppointmentCalendar';
import { CrmService } from '@/features/crm/services/crm.service';
import { StaffService } from '@/features/staff/services/staff.service';

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
  const crmService = new CrmService();
  const staffService = new StaffService();

  const [appointmentsRes, servicesRes, customersRes, staffRes] = await Promise.all([
    appointmentsService.getWorkspaceAppointments(workspace.id),
    appointmentsService.getWorkspaceServices(workspace.id),
    crmService.getWorkspaceCustomers(workspace.id),
    staffService.getWorkspaceStaff(workspace.id),
  ]);

  if (appointmentsRes.error && appointmentsRes.error.code === 'MODULE_DISABLED') {
    redirect(`/${workspace.slug}/settings/modules`);
  }

  const appointments = appointmentsRes.data || [];
  const services = servicesRes.data || [];
  const customers = customersRes.data || [];
  const staffProfiles = staffRes.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Appointments & Scheduling</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage bookings, recurring slots, and quick walk-in appointments for <strong className="text-primary font-semibold">{workspace.name}</strong>.
        </p>
      </div>

      <AppointmentCalendar
        workspaceId={workspace.id}
        initialAppointments={appointments}
        services={services}
        customers={customers}
        staffProfiles={staffProfiles}
      />
    </div>
  );
}
