import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { Appointment, CreateAppointmentInput, ServiceItem, UpdateAppointmentStatusInput } from '../types';
import type { Database } from '@/types/database';

export class AppointmentsRepository {
  async getWorkspaceAppointments(workspaceId: string): Promise<Result<Appointment[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: rawData, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('start_time', { ascending: true });

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'APPOINTMENTS_FETCH_FAILED'));
      }

      const rows = (rawData || []) as unknown as Database['public']['Tables']['appointments']['Row'][];

      const appointments: Appointment[] = rows.map((r) => ({
        id: r.id,
        workspaceId: r.workspace_id,
        customerId: r.customer_id,
        customerName: r.customer_name,
        customerEmail: r.customer_email,
        customerPhone: r.customer_phone,
        serviceId: r.service_id,
        serviceName: r.service_name,
        staffId: r.staff_id,
        staffName: r.staff_name,
        startTime: r.start_time,
        endTime: r.end_time,
        status: r.status as Appointment['status'],
        isWalkIn: r.is_walk_in,
        notes: r.notes,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      return ok(appointments);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async createAppointment(input: CreateAppointmentInput): Promise<Result<Appointment>> {
    try {
      const supabase = await createServerSupabaseClient();
      const startDate = new Date(input.startTime);
      const endDate = new Date(startDate.getTime() + (input.durationMin || 30) * 60000);

      const insertPayload: Database['public']['Tables']['appointments']['Insert'] = {
        workspace_id: input.workspaceId,
        customer_id: input.customerId || null,
        customer_name: input.customerName,
        customer_email: input.customerEmail || null,
        customer_phone: input.customerPhone || null,
        service_id: input.serviceId || null,
        service_name: input.serviceName,
        staff_id: input.staffId || null,
        staff_name: input.staffName || 'Any Available Staff',
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        is_walk_in: input.isWalkIn,
        notes: input.notes || null,
        status: 'SCHEDULED',
      };

      const { data: rawData, error } = await supabase
        .from('appointments')
        .insert(insertPayload as never)
        .select()
        .single();

      if (error || !rawData) {
        return fail(AppErrorFactory.badRequest(error?.message || 'Failed to create appointment', 'APPOINTMENT_CREATE_FAILED'));
      }

      const r = rawData as unknown as Database['public']['Tables']['appointments']['Row'];

      const appointment: Appointment = {
        id: r.id,
        workspaceId: r.workspace_id,
        customerId: r.customer_id,
        customerName: r.customer_name,
        customerEmail: r.customer_email,
        customerPhone: r.customer_phone,
        serviceId: r.service_id,
        serviceName: r.service_name,
        staffId: r.staff_id,
        staffName: r.staff_name,
        startTime: r.start_time,
        endTime: r.end_time,
        status: r.status as Appointment['status'],
        isWalkIn: r.is_walk_in,
        notes: r.notes,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };

      return ok(appointment);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async updateAppointmentStatus(input: UpdateAppointmentStatusInput): Promise<Result<boolean>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase
        .from('appointments')
        .update({ status: input.status, updated_at: new Date().toISOString() } as never)
        .eq('id', input.appointmentId)
        .eq('workspace_id', input.workspaceId);

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'APPOINTMENT_STATUS_UPDATE_FAILED'));
      }

      return ok(true);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getWorkspaceServices(workspaceId: string): Promise<Result<ServiceItem[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: rawData, error } = await supabase
        .from('services')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('is_active', true);

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'SERVICES_FETCH_FAILED'));
      }

      const rows = (rawData || []) as unknown as Database['public']['Tables']['services']['Row'][];

      const services: ServiceItem[] = rows.map((s) => ({
        id: s.id,
        workspaceId: s.workspace_id,
        name: s.name,
        category: s.category,
        description: s.description,
        durationMin: s.duration_min,
        price: Number(s.price),
        isActive: s.is_active,
      }));

      return ok(services);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }
}
