import { z } from 'zod';
import { InvoiceStatus } from '../types';

export const InvoiceLineItemSchema = z.object({
  service_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  tax_rate: z.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100').default(0),
});

export const CreateInvoiceSchema = z.object({
  workspace_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional().nullable(),
  currency: z.string().length(3).default('USD'),
  issue_date: z.string().datetime().optional(),
  due_date: z.string().datetime().optional(),
  notes: z.string().optional().nullable(),
  items: z.array(InvoiceLineItemSchema).min(1, 'At least one line item is required'),
});

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
export type InvoiceLineItemInput = z.infer<typeof InvoiceLineItemSchema>;

export const UpdateInvoiceSchema = CreateInvoiceSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED']).optional(),
});

export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;

// Allowed Status Transitions
export const ALLOWED_STATUS_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ['SENT', 'CANCELLED'],
  SENT: ['PARTIALLY_PAID', 'PAID', 'CANCELLED'],
  PARTIALLY_PAID: ['PAID'],
  PAID: ['REFUNDED'],
  OVERDUE: ['PARTIALLY_PAID', 'PAID', 'CANCELLED'],
  CANCELLED: [],
  REFUNDED: [],
};
