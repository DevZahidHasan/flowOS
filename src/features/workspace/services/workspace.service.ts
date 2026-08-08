import { WorkspaceRepository } from '../repositories/workspace.repository';
import { CreateWorkspaceInput, ToggleModuleInput } from '@/types/workspace';
import { Result, fail, ok } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { Workspace, WorkspaceModule, ModuleKey } from '@/types/global';

export class WorkspaceService {
  private workspaceRepo: WorkspaceRepository;

  constructor(workspaceRepo?: WorkspaceRepository) {
    this.workspaceRepo = workspaceRepo || new WorkspaceRepository();
  }

  async createWorkspace(userId: string, input: CreateWorkspaceInput): Promise<Result<Workspace>> {
    if (!userId) {
      return fail(AppErrorFactory.unauthorized('User must be logged in to create a workspace'));
    }
    return this.workspaceRepo.createWorkspace(userId, input);
  }

  async getUserWorkspaces(userId: string): Promise<Result<Workspace[]>> {
    if (!userId) {
      return fail(AppErrorFactory.unauthorized('User not authenticated'));
    }
    return this.workspaceRepo.getUserWorkspaces(userId);
  }

  async getWorkspaceBySlug(slug: string): Promise<Result<Workspace | null>> {
    return this.workspaceRepo.getWorkspaceBySlug(slug);
  }

  async getWorkspaceById(id: string): Promise<Result<Workspace | null>> {
    return this.workspaceRepo.getWorkspaceById(id);
  }

  async getWorkspaceModules(workspaceId: string): Promise<Result<WorkspaceModule[]>> {
    return this.workspaceRepo.getWorkspaceModules(workspaceId);
  }

  async isModuleEnabled(workspaceId: string, moduleKey: ModuleKey): Promise<Result<boolean>> {
    const modulesRes = await this.workspaceRepo.getWorkspaceModules(workspaceId);
    if (modulesRes.error) {
      return fail(modulesRes.error);
    }
    const targetModule = modulesRes.data.find((m) => m.moduleKey === moduleKey);
    return ok(targetModule ? targetModule.isEnabled : false);
  }

  async toggleModule(userId: string, input: ToggleModuleInput): Promise<Result<boolean>> {
    // Permission check: only OWNER or ADMIN can toggle modules
    const memberRes = await this.workspaceRepo.getMemberRole(input.workspaceId, userId);
    if (memberRes.error) {
      return fail(memberRes.error);
    }

    const member = memberRes.data;
    if (!member || (member.role !== 'owner' && member.role !== 'manager')) {
      return fail(AppErrorFactory.forbidden('Only workspace Owners and Managers can toggle modules'));
    }

    return this.workspaceRepo.toggleModule(input);
  }
}
