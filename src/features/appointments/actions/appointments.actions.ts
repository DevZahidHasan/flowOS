'use server';

import { AppointmentsService } from '../services/appointments.service';
import { createAppointmentSchema, updateAppointmentStatusSchema } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Appointment } from '../types';

const appointmentsService = new AppointmentsService();

export async function getAppointmentsAction(workspaceId: string): Promise<Result<Appointment[]>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return appointmentsService.getWorkspaceAppointments(workspaceId);
}

export async function createAppointmentAction(formData: unknown): Promise<Result<Appointment>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  const parsed = createAppointmentSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid appointment details'));
  }

  return appointmentsService.createAppointment(parsed.data);
}

export async function updateAppointmentStatusAction(formData: unknown): Promise<Result<boolean>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  const parsed = updateAppointmentStatusSchema.safeParse(formData);
  if (!parsed.success) {
    return fail(AppErrorFactory.badRequest(parsed.error.errors[0]?.message || 'Invalid status payload'));
  }

  return appointmentsService.updateAppointmentStatus(parsed.data);
}
