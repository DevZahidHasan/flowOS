import { z } from 'zod';

export type AppointmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface ServiceItem {
  id: string;
  workspaceId: string;
  name: string;
  category: string;
  description: string | null;
  durationMin: number;
  price: number;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  workspaceId: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  serviceId: string | null;
  serviceName: string;
  staffId: string | null;
  staffName: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  isWalkIn: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const createAppointmentSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  customerPhone: z.string().optional().or(z.literal('')),
  serviceId: z.string().uuid('Invalid service ID').optional().nullable(),
  serviceName: z.string().min(2, 'Service name is required'),
  staffId: z.string().uuid('Invalid staff ID').optional().nullable(),
  staffName: z.string().default('Any Available Staff'),
  startTime: z.string().min(1, 'Start time is required'),
  durationMin: z.number().min(5).default(30),
  isWalkIn: z.boolean().default(false),
  notes: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  appointmentId: z.string().uuid('Invalid appointment ID'),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
