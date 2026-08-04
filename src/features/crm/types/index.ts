import { z } from 'zod';

export type TimelineEventType =
  | 'CREATED'
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_COMPLETED'
  | 'INVOICE_PAID'
  | 'POINTS_ADDED'
  | 'NOTE_ADDED';

export interface CustomerTimelineEvent {
  id: string;
  workspaceId: string;
  customerId: string;
  eventType: TimelineEventType;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface CustomerNote {
  id: string;
  workspaceId: string;
  customerId: string;
  authorName: string;
  note: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  workspaceId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  birthday: string | null;
  marketingConsent: boolean;
  referralSource: string;
  preferredStaffName: string | null;
  preferredServiceName: string | null;
  tags: string[];
  loyaltyPoints: number;
  totalVisits: number;
  lifetimeSpending: number;
  outstandingBalance: number;
  lastVisitAt: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: CustomerNote[];
  timeline?: CustomerTimelineEvent[];
}

export const createCustomerSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  fullName: z.string().min(2, 'Customer name must be at least 2 characters'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')),
  marketingConsent: z.boolean().default(false),
  referralSource: z.string().default('Direct'),
  preferredStaffName: z.string().optional(),
  preferredServiceName: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const addCustomerNoteSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  customerId: z.string().uuid('Invalid customer ID'),
  authorName: z.string().default('Staff Member'),
  note: z.string().min(1, 'Note cannot be empty'),
});

export const csvImportCustomerSchema = z.array(createCustomerSchema);

export const updateCustomerSchema = createCustomerSchema.extend({
  customerId: z.string().uuid('Invalid customer ID'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type AddCustomerNoteInput = z.infer<typeof addCustomerNoteSchema>;
