import { StaffRepository } from '../repositories/staff.repository';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { CreateStaffInput, StaffMember } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';

export class StaffService {
  private repo: StaffRepository;
  private workspaceService: WorkspaceService;

  constructor(repo?: StaffRepository, workspaceService?: WorkspaceService) {
    this.repo = repo || new StaffRepository();
    this.workspaceService = workspaceService || new WorkspaceService();
  }

  private async assertStaffModuleEnabled(workspaceId: string): Promise<Result<boolean>> {
    const check = await this.workspaceService.isModuleEnabled(workspaceId, 'staff');
    if (check.error) return fail(check.error);
    if (!check.data) {
      return fail(AppErrorFactory.forbidden('Staff module is disabled for this workspace. Enable it in Settings.', 'MODULE_DISABLED'));
    }
    return check;
  }

  async getWorkspaceStaff(workspaceId: string): Promise<Result<StaffMember[]>> {
    const moduleCheck = await this.assertStaffModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.getWorkspaceStaff(workspaceId);
  }

  async createStaff(input: CreateStaffInput): Promise<Result<StaffMember>> {
    const moduleCheck = await this.assertStaffModuleEnabled(input.workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.createStaff(input);
  }

  async toggleStaffStatus(workspaceId: string, staffId: string, isActive: boolean): Promise<Result<boolean>> {
    const moduleCheck = await this.assertStaffModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.toggleStaffStatus(workspaceId, staffId, isActive);
  }
}
