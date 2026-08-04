import { InvoicesRepository } from '../repositories/invoices.repository';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { CreateInvoiceInput, Invoice, UpdateInvoiceStatusInput } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';

export class InvoicesService {
  private repo: InvoicesRepository;
  private workspaceService: WorkspaceService;

  constructor(repo?: InvoicesRepository, workspaceService?: WorkspaceService) {
    this.repo = repo || new InvoicesRepository();
    this.workspaceService = workspaceService || new WorkspaceService();
  }

  private async assertInvoicesModuleEnabled(workspaceId: string): Promise<Result<boolean>> {
    const check = await this.workspaceService.isModuleEnabled(workspaceId, 'invoices');
    if (check.error) return fail(check.error);
    if (!check.data) {
      return fail(AppErrorFactory.forbidden('Invoices module is disabled for this workspace. Enable it in Settings.', 'MODULE_DISABLED'));
    }
    return check;
  }

  async getWorkspaceInvoices(workspaceId: string): Promise<Result<Invoice[]>> {
    const moduleCheck = await this.assertInvoicesModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.getWorkspaceInvoices(workspaceId);
  }

  async createInvoice(input: CreateInvoiceInput): Promise<Result<Invoice>> {
    const moduleCheck = await this.assertInvoicesModuleEnabled(input.workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.createInvoice(input);
  }

  async updateInvoiceStatus(input: UpdateInvoiceStatusInput): Promise<Result<boolean>> {
    const moduleCheck = await this.assertInvoicesModuleEnabled(input.workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.updateInvoiceStatus(input);
  }
}
