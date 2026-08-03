import { z } from 'zod';

export interface StaffSchedule {
  id: string;
  workspaceId: string;
  staffId: string;
  dayOfWeek: number; // 0=Sun, 6=Sat
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  isDayOff: boolean;
}

export interface StaffMember {
  id: string;
  workspaceId: string;
  userId: string | null;
  displayName: string;
  roleTitle: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  commissionRate: number;
  specialties: string[];
  skills: string[];
  isActive: boolean;
  averageRating: number;
  completedAppointments: number;
  totalRevenueGenerated: number;
  createdAt: string;
  schedules?: StaffSchedule[];
  serviceIds?: string[];
}

export const createStaffSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  roleTitle: z.string().default('Staff Member'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  commissionRate: z.number().min(0).max(100).default(0),
  specialties: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
