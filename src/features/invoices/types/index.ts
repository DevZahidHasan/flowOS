import { z } from 'zod';

export type InvoiceStatus = 'DRAFT' | 'UNPAID' | 'PAID' | 'VOID';

export interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  workspaceId: string;
  customerId: string;
  appointmentId: string | null;
  invoiceNumber: string;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items?: InvoiceItem[];
  customerName?: string; // Hydrated from DB join
}

export const invoiceItemSchema = z.object({
  description: z.string().min(2, 'Description is required'),
  quantity: z.number().min(1).default(1),
  unitPrice: z.number().min(0),
});

export const createInvoiceSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  customerId: z.string().uuid('Invalid customer ID'),
  appointmentId: z.string().uuid().optional().nullable(),
  taxAmount: z.number().min(0).default(0),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

export const updateInvoiceStatusSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  invoiceId: z.string().uuid('Invalid invoice ID'),
  status: z.enum(['DRAFT', 'UNPAID', 'PAID', 'VOID']),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type CreateInvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema>;
