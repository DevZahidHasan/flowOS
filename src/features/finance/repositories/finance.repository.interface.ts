import { Result } from '@/lib/result/result';
import { Expense, CreateExpenseInput, UpdateExpenseInput } from '../types';

export interface IFinanceRepository {
  getExpenses(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Result<Expense[]>>;

  getExpenseById(
    workspaceId: string,
    expenseId: string
  ): Promise<Result<Expense>>;

  createExpense(
    workspaceId: string,
    input: CreateExpenseInput,
    userId: string
  ): Promise<Result<Expense>>;

  updateExpense(
    workspaceId: string,
    expenseId: string,
    input: UpdateExpenseInput
  ): Promise<Result<Expense>>;

  deleteExpense(
    workspaceId: string,
    expenseId: string
  ): Promise<Result<boolean>>;

  getPayments(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Result<any[]>>;

  getInvoices(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Result<any[]>>;
}
