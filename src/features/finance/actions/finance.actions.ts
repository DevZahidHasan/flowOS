'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { FinanceRepository } from '../repositories/finance.repository';
import { FinanceService } from '../services/finance.service';
import { 
  Expense, CreateExpenseInput, createExpenseSchema, 
  UpdateExpenseInput, updateExpenseSchema, FinanceFilters 
} from '../types';

const financeRepo = new FinanceRepository();
const financeService = new FinanceService(financeRepo);

async function verifyWorkspaceMembership(workspaceId: string): Promise<Result<{ userId: string }>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  const { data: membership, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (error || !membership) {
    return fail(AppErrorFactory.forbidden('Access denied. You are not a member of this workspace.', 'WORKSPACE_ACCESS_DENIED'));
  }

  return { data: { userId: user.id }, error: null };
}

export async function getExpensesAction(
  workspaceId: string,
  filters?: FinanceFilters
): Promise<Result<Expense[]>> {
  const authCheck = await verifyWorkspaceMembership(workspaceId);
  if (authCheck.error) return fail(authCheck.error);

  return financeService.getExpenses(workspaceId, filters);
}

export async function createExpenseAction(
  workspaceId: string,
  input: CreateExpenseInput
): Promise<Result<Expense>> {
  const authCheck = await verifyWorkspaceMembership(workspaceId);
  if (authCheck.error) return fail(authCheck.error);

  const validation = createExpenseSchema.safeParse(input);
  if (!validation.success) {
    return fail(AppErrorFactory.badRequest('Invalid expense inputs: ' + validation.error.message));
  }

  return financeService.createExpense(workspaceId, validation.data, authCheck.data.userId);
}

export async function updateExpenseAction(
  workspaceId: string,
  expenseId: string,
  input: UpdateExpenseInput
): Promise<Result<Expense>> {
  const authCheck = await verifyWorkspaceMembership(workspaceId);
  if (authCheck.error) return fail(authCheck.error);

  const validation = updateExpenseSchema.safeParse(input);
  if (!validation.success) {
    return fail(AppErrorFactory.badRequest('Invalid expense updates: ' + validation.error.message));
  }

  return financeService.updateExpense(workspaceId, expenseId, validation.data);
}

export async function deleteExpenseAction(
  workspaceId: string,
  expenseId: string
): Promise<Result<boolean>> {
  const authCheck = await verifyWorkspaceMembership(workspaceId);
  if (authCheck.error) return fail(authCheck.error);

  return financeService.deleteExpense(workspaceId, expenseId);
}
