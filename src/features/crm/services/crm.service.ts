import { CrmRepository } from '../repositories/crm.repository';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { AddCustomerNoteInput, CreateCustomerInput, Customer, CustomerNote, CustomerTimelineEvent } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';

export class CrmService {
  private repo: CrmRepository;
  private workspaceService: WorkspaceService;

  constructor(repo?: CrmRepository, workspaceService?: WorkspaceService) {
    this.repo = repo || new CrmRepository();
    this.workspaceService = workspaceService || new WorkspaceService();
  }

  private async assertCrmModuleEnabled(workspaceId: string): Promise<Result<boolean>> {
    const check = await this.workspaceService.isModuleEnabled(workspaceId, 'crm');
    if (check.error) return fail(check.error);
    if (!check.data) {
      return fail(AppErrorFactory.forbidden('CRM module is disabled for this workspace. Enable it in Settings.', 'MODULE_DISABLED'));
    }
    return check;
  }

  async getWorkspaceCustomers(workspaceId: string): Promise<Result<Customer[]>> {
    const moduleCheck = await this.assertCrmModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.getWorkspaceCustomers(workspaceId);
  }

  async getCustomerDetails(workspaceId: string, customerId: string): Promise<Result<{ customer: Customer; notes: CustomerNote[]; timeline: CustomerTimelineEvent[] }>> {
    const moduleCheck = await this.assertCrmModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.getCustomerDetails(workspaceId, customerId);
  }

  async createCustomer(input: CreateCustomerInput): Promise<Result<Customer>> {
    const moduleCheck = await this.assertCrmModuleEnabled(input.workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.createCustomer(input);
  }

  async addNote(input: AddCustomerNoteInput): Promise<Result<CustomerNote>> {
    const moduleCheck = await this.assertCrmModuleEnabled(input.workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.addNote(input);
  }
}
