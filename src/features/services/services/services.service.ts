import { ServicesRepository } from '../repositories/services.repository';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { CreateServiceInput, UpdateServiceInput, Service } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';

export class ServicesService {
  private repo: ServicesRepository;
  private workspaceService: WorkspaceService;

  constructor(repo?: ServicesRepository, workspaceService?: WorkspaceService) {
    this.repo = repo || new ServicesRepository();
    this.workspaceService = workspaceService || new WorkspaceService();
  }

  private async assertServicesModuleEnabled(workspaceId: string): Promise<Result<boolean>> {
    const check = await this.workspaceService.isModuleEnabled(workspaceId, 'services');
    if (check.error) return fail(check.error);
    if (!check.data) {
      return fail(AppErrorFactory.forbidden('Services module is disabled for this workspace. Enable it in Settings.', 'MODULE_DISABLED'));
    }
    return check;
  }

  async getWorkspaceServices(workspaceId: string): Promise<Result<Service[]>> {
    const moduleCheck = await this.assertServicesModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.getWorkspaceServices(workspaceId);
  }

  async createService(input: CreateServiceInput): Promise<Result<Service>> {
    const moduleCheck = await this.assertServicesModuleEnabled(input.workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.createService(input);
  }

  async updateService(input: UpdateServiceInput): Promise<Result<Service>> {
    const moduleCheck = await this.assertServicesModuleEnabled(input.workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.updateService(input);
  }

  async toggleServiceStatus(workspaceId: string, serviceId: string, isActive: boolean): Promise<Result<boolean>> {
    const moduleCheck = await this.assertServicesModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.toggleServiceStatus(workspaceId, serviceId, isActive);
  }

  async deleteService(workspaceId: string, serviceId: string): Promise<Result<boolean>> {
    const moduleCheck = await this.assertServicesModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.deleteService(workspaceId, serviceId);
  }
}
