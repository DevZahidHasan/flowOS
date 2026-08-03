import { z } from 'zod';

export const SERVICE_CATEGORIES = [
  'Hair & Styling',
  'Spa & Wellness',
  'Massage Therapy',
  'Dental & Medical',
  'Consultation',
  'Training & Coaching',
  'Repair & Maintenance',
  'Office Services',
  'General',
] as const;

export interface Service {
  id: string;
  workspaceId: string;
  name: string;
  category: string;
  description: string | null;
  durationMin: number;
  prepTimeMin: number;
  bufferTimeMin: number;
  cleanupTimeMin: number;
  price: number;
  taxRate: number;
  requiredSkill: string | null;
  colorCode: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const createServiceSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  category: z.string().default('General'),
  description: z.string().optional().or(z.literal('')),
  durationMin: z.number().min(5).default(30),
  prepTimeMin: z.number().default(0),
  bufferTimeMin: z.number().default(0),
  cleanupTimeMin: z.number().default(0),
  price: z.number().min(0).default(0),
  taxRate: z.number().min(0).default(0),
  requiredSkill: z.string().optional().or(z.literal('')),
  colorCode: z.string().default('#8B5CF6'),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateServiceSchema = createServiceSchema.extend({
  serviceId: z.string().uuid('Invalid service ID'),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
