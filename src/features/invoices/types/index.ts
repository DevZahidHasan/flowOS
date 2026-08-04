import { Database } from '@/types/database';

export type InvoiceStatus = Database['public']['Enums']['invoice_status'];

export type InvoiceRow = Database['public']['Tables']['invoices']['Row'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];

export type InvoiceLineItemRow = Database['public']['Tables']['invoice_line_items']['Row'];
export type InvoiceLineItemInsert = Database['public']['Tables']['invoice_line_items']['Insert'];

export interface InvoiceWithItems extends InvoiceRow {
  items: InvoiceLineItemRow[];
}
