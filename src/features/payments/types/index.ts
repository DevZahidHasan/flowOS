import { z } from 'zod';
import type { Database } from '@/types/database';

// ─────────────────────────────────────────────────────────────────
// Derived DB types
// ─────────────────────────────────────────────────────────────────
export type PaymentMethod = Database['public']['Enums']['payment_method'];
export type PaymentRow    = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];

// ─────────────────────────────────────────────────────────────────
// Domain constants
// ─────────────────────────────────────────────────────────────────
export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH',          label: 'Cash' },
  { value: 'CARD',          label: 'Card (POS)' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'MOBILE_BANKING',label: 'Mobile Banking' },
  { value: 'CHEQUE',        label: 'Cheque' },
  { value: 'OTHER',         label: 'Other' },
];

// ─────────────────────────────────────────────────────────────────
// Validation schemas
// ─────────────────────────────────────────────────────────────────
export const RecordPaymentSchema = z.object({
  workspace_id:     z.string().uuid('Invalid workspace ID'),
  invoice_id:       z.string().uuid('Invalid invoice ID'),
  amount:           z.number().positive('Amount must be greater than zero'),
  payment_method:   z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_BANKING', 'CHEQUE', 'OTHER']),
  reference_number: z.string().max(255).optional().nullable(),
  notes:            z.string().max(1000).optional().nullable(),
  payment_date:     z.string().datetime({ message: 'Invalid payment date' }),
  received_by:      z.string().max(255).optional().nullable(),
});

export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;

// ─────────────────────────────────────────────────────────────────
// Computed invoice balance — returned by service layer
// ─────────────────────────────────────────────────────────────────
export interface InvoicePaymentSummary {
  invoiceTotal:    number;
  totalPaid:       number;
  outstanding:     number;
  payments:        PaymentRow[];
}
