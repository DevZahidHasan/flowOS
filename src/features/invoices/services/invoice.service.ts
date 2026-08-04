import { InvoiceRepository } from '../repositories/invoice.repository';
import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { CreateInvoiceInput, UpdateInvoiceInput, ALLOWED_STATUS_TRANSITIONS } from '../validations/invoice.schema';
import { InvoiceWithItems, InvoiceRow } from '../types';
import { calculateInvoiceTotals } from '../utils/invoice-calculator';
import { generateInvoiceNumber } from '../utils/invoice-number';
import { CrmRepository } from '@/features/crm/repositories/crm.repository';

export class InvoiceService {
  /**
   * Creates an invoice with full business validation.
   */
  static async createInvoice(input: CreateInvoiceInput, userId: string): Promise<Result<InvoiceWithItems>> {
    try {
      // 1. Validate Customer Belongs to Workspace
      const crmRepo = new CrmRepository();
      const customerRes = await crmRepo.getCustomerDetails(input.workspace_id, input.customer_id);
      
      if (customerRes.error) {
        return fail(AppErrorFactory.badRequest('Invalid customer or customer does not belong to this workspace', 'INVALID_CUSTOMER'));
      }

      // 2. Generate Next Invoice Number
      const countRes = await InvoiceRepository.countInvoicesByWorkspace(input.workspace_id);
      if (countRes.error) return fail(countRes.error);
      
      // We assume a prefix like 'INV'. In future, this could be fetched from workspace settings.
      const invoiceNumber = generateInvoiceNumber('INV', countRes.data + 1);

      // 3. Perform Precision Calculations
      const calculations = calculateInvoiceTotals(input.items);

      // 4. Construct DB Payload
      const invoiceData = {
        workspace_id: input.workspace_id,
        customer_id: input.customer_id,
        appointment_id: input.appointment_id || null,
        invoice_number: invoiceNumber,
        status: 'DRAFT' as const,
        currency: input.currency,
        subtotal: calculations.subtotal,
        discount_amount: calculations.totalDiscount,
        tax_amount: calculations.totalTax,
        total_amount: calculations.grandTotal,
        issue_date: input.issue_date || new Date().toISOString(),
        due_date: input.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: input.notes || null,
        created_by: userId,
        updated_by: userId,
      };

      const lineItemsData = calculations.items.map((item) => ({
        service_id: item.service_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount,
        tax_rate: item.tax_rate,
        total: item.total,
        created_by: userId,
        updated_by: userId,
      }));

      // 5. Delegate to Repository for Persistence
      return await InvoiceRepository.createInvoice(invoiceData, lineItemsData as any);
    } catch (error) {
      return fail(AppErrorFactory.fromUnknown(error));
    }
  }

  /**
   * Updates an invoice, ensuring status transitions are strictly adhered to.
   */
  static async updateInvoice(
    workspaceId: string, 
    invoiceId: string, 
    input: UpdateInvoiceInput,
    userId: string
  ): Promise<Result<InvoiceRow>> {
    try {
      // 1. Fetch current invoice to validate state
      const currentRes = await InvoiceRepository.getInvoiceById(workspaceId, invoiceId);
      if (currentRes.error) return fail(currentRes.error);
      
      const currentInvoice = currentRes.data;

      // 2. Validate Status Transition (if status is being updated)
      if (input.status && input.status !== currentInvoice.status) {
        const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentInvoice.status];
        if (!allowedTransitions.includes(input.status)) {
          return fail(AppErrorFactory.badRequest(`Invalid status transition from ${currentInvoice.status} to ${input.status}`, 'INVALID_STATUS_TRANSITION'));
        }
      }

      // Note: If line items were being updated, we would recalculate everything here.
      // For this phase, we only handle top-level invoice updates (like status, notes, due date).
      // Line item updates would require a more complex sync (delete missing, update existing, add new) 
      // or immutable append-only ledgers.

      const updates = {
        ...input,
        updated_by: userId,
        updated_at: new Date().toISOString()
      };

      // Ensure we don't pass `items` into the invoice repository update payload
      if ('items' in updates) {
        delete (updates as any).items;
      }
      if ('id' in updates) {
        delete (updates as any).id;
      }

      return await InvoiceRepository.updateInvoice(workspaceId, invoiceId, updates as any);
    } catch (error) {
      return fail(AppErrorFactory.fromUnknown(error));
    }
  }

  static async getInvoice(workspaceId: string, invoiceId: string): Promise<Result<InvoiceWithItems>> {
    return await InvoiceRepository.getInvoiceById(workspaceId, invoiceId);
  }

  static async getInvoices(options: {
    workspaceId: string;
    page: number;
    limit: number;
    search?: string;
    status?: string;
    customerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Result<{ data: InvoiceRow[]; count: number }>> {
    return await InvoiceRepository.getInvoices(options);
  }

  static async deleteInvoice(workspaceId: string, invoiceId: string): Promise<Result<null>> {
    // 1. Fetch invoice to ensure it exists and check status
    const currentRes = await InvoiceRepository.getInvoiceById(workspaceId, invoiceId);
    if (currentRes.error) return fail(currentRes.error);
    
    // Business Rule: Can only delete DRAFT invoices. Sent or paid must be CANCELLED or REFUNDED.
    if (currentRes.data.status !== 'DRAFT') {
      return fail(AppErrorFactory.badRequest('Only DRAFT invoices can be deleted. Cancel or refund processed invoices instead.', 'INVALID_DELETE_STATE'));
    }

    return await InvoiceRepository.deleteInvoice(workspaceId, invoiceId);
  }
}
