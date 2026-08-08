import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { IFinanceRepository } from './finance.repository.interface';
import { Expense, CreateExpenseInput, UpdateExpenseInput } from '../types';

function mapRowToExpense(row: any): Expense {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    title: row.title,
    description: row.description,
    amount: Number(row.amount),
    category: row.category,
    expenseDate: row.expense_date,
    paymentMethod: row.payment_method,
    isRecurring: row.is_recurring,
    recurrencePeriod: row.recurrence_period,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export class FinanceRepository implements IFinanceRepository {
  async getExpenses(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Result<Expense[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null);

      if (startDate) {
        query = query.gte('expense_date', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        query = query.lte('expense_date', endDate.toISOString().split('T')[0]);
      }

      query = query.order('expense_date', { ascending: false });

      const { data, error } = await query;
      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'FINANCE_EXPENSES_FETCH_FAILED'));
      }

      return ok((data || []).map(mapRowToExpense));
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getExpenseById(
    workspaceId: string,
    expenseId: string
  ): Promise<Result<Expense>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('id', expenseId)
        .is('deleted_at', null)
        .single();

      if (error) {
        return fail(AppErrorFactory.notFound(`Expense with ID ${expenseId} not found`, 'FINANCE_EXPENSE_NOT_FOUND'));
      }

      return ok(mapRowToExpense(data));
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async createExpense(
    workspaceId: string,
    input: CreateExpenseInput,
    userId: string
  ): Promise<Result<Expense>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          workspace_id: workspaceId,
          title: input.title,
          description: input.description || null,
          amount: input.amount,
          category: input.category,
          expense_date: input.expenseDate,
          payment_method: input.paymentMethod,
          is_recurring: input.isRecurring,
          recurrence_period: input.recurrencePeriod || null,
          created_by: userId,
        } as never)
        .select()
        .single();

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'FINANCE_EXPENSE_CREATE_FAILED'));
      }

      return ok(mapRowToExpense(data));
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async updateExpense(
    workspaceId: string,
    expenseId: string,
    input: UpdateExpenseInput
  ): Promise<Result<Expense>> {
    try {
      const supabase = await createServerSupabaseClient();
      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.amount !== undefined) updateData.amount = input.amount;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.expenseDate !== undefined) updateData.expense_date = input.expenseDate;
      if (input.paymentMethod !== undefined) updateData.payment_method = input.paymentMethod;
      if (input.isRecurring !== undefined) updateData.is_recurring = input.isRecurring;
      if (input.recurrencePeriod !== undefined) updateData.recurrence_period = input.recurrencePeriod;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('expenses')
        .update(updateData as never)
        .eq('workspace_id', workspaceId)
        .eq('id', expenseId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'FINANCE_EXPENSE_UPDATE_FAILED'));
      }

      return ok(mapRowToExpense(data));
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async deleteExpense(
    workspaceId: string,
    expenseId: string
  ): Promise<Result<boolean>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase
        .from('expenses')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('workspace_id', workspaceId)
        .eq('id', expenseId);

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'FINANCE_EXPENSE_DELETE_FAILED'));
      }

      return ok(true);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getPayments(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Result<any[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      let query = supabase
        .from('payments')
        .select(`
          id,
          workspace_id,
          invoice_id,
          amount,
          payment_method,
          reference_number,
          notes,
          payment_date,
          created_at,
          invoices (
            invoice_number,
            total_amount,
            tax_amount,
            customer_id,
            customers (
              full_name
            ),
            appointment_id,
            appointments (
              services (
                name
              ),
              staff_profiles (
                display_name
              )
            )
          )
        `)
        .eq('workspace_id', workspaceId)
        .is('deleted_at', null);

      if (startDate) {
        query = query.gte('payment_date', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('payment_date', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'FINANCE_PAYMENTS_FETCH_FAILED'));
      }

      return ok(data || []);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async getInvoices(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Result<any[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      let query = supabase
        .from('invoices')
        .select(`
          id,
          workspace_id,
          customer_id,
          invoice_number,
          status,
          subtotal,
          tax_amount,
          total_amount,
          issue_date,
          due_date,
          notes,
          created_at,
          customers (
            full_name
          )
        `)
        .eq('workspace_id', workspaceId);

      if (startDate) {
        query = query.gte('issue_date', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('issue_date', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'FINANCE_INVOICES_FETCH_FAILED'));
      }

      return ok(data || []);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }
}
