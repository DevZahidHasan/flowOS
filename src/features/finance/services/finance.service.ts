import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { IFinanceRepository } from '../repositories/finance.repository.interface';
import { 
  Expense, CreateExpenseInput, UpdateExpenseInput, 
  FinanceFilters
} from '../types';

export class FinanceService {
  private repo: IFinanceRepository;
  private workspaceService: WorkspaceService;

  constructor(repo: IFinanceRepository, workspaceService?: WorkspaceService) {
    this.repo = repo;
    this.workspaceService = workspaceService || new WorkspaceService();
  }

  private async assertFinanceModuleEnabled(workspaceId: string): Promise<Result<boolean>> {
    const check = await this.workspaceService.isModuleEnabled(workspaceId, 'finance');
    if (check.error) return fail(check.error);
    if (!check.data) {
      return fail(AppErrorFactory.forbidden('Finance module is disabled for this workspace.', 'MODULE_DISABLED'));
    }
    return check;
  }

  async getExpenses(
    workspaceId: string,
    filters?: FinanceFilters
  ): Promise<Result<Expense[]>> {
    const check = await this.assertFinanceModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (filters?.startDate) {
      startDate = new Date(filters.startDate);
    }
    if (filters?.endDate) {
      endDate = new Date(filters.endDate);
    }

    const res = await this.repo.getExpenses(workspaceId, startDate, endDate);
    if (res.error) return fail(res.error);

    let expenses = res.data;
    if (filters?.category) {
      expenses = expenses.filter((e) => e.category === filters.category);
    }

    return ok(expenses);
  }

  async getExpenseById(workspaceId: string, expenseId: string): Promise<Result<Expense>> {
    const check = await this.assertFinanceModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    return this.repo.getExpenseById(workspaceId, expenseId);
  }

  async createExpense(
    workspaceId: string,
    input: CreateExpenseInput,
    userId: string
  ): Promise<Result<Expense>> {
    const check = await this.assertFinanceModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    return this.repo.createExpense(workspaceId, input, userId);
  }

  async updateExpense(
    workspaceId: string,
    expenseId: string,
    input: UpdateExpenseInput
  ): Promise<Result<Expense>> {
    const check = await this.assertFinanceModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    return this.repo.updateExpense(workspaceId, expenseId, input);
  }

  async deleteExpense(workspaceId: string, expenseId: string): Promise<Result<boolean>> {
    const check = await this.assertFinanceModuleEnabled(workspaceId);
    if (check.error) return fail(check.error);

    return this.repo.deleteExpense(workspaceId, expenseId);
  }
}
