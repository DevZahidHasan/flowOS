import { QueueRepository } from '../repositories/queue.repository';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { CreateTokenInput, QueueToken, UpdateTokenStatusInput } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';

export class QueueService {
  private repo: QueueRepository;
  private workspaceService: WorkspaceService;

  constructor(repo?: QueueRepository, workspaceService?: WorkspaceService) {
    this.repo = repo || new QueueRepository();
    this.workspaceService = workspaceService || new WorkspaceService();
  }

  private async assertQueueModuleEnabled(workspaceId: string): Promise<Result<boolean>> {
    const check = await this.workspaceService.isModuleEnabled(workspaceId, 'queue');
    if (check.error) return fail(check.error);
    if (!check.data) {
      return fail(AppErrorFactory.forbidden('Queue module is currently disabled for this workspace. Enable it in Settings.', 'MODULE_DISABLED'));
    }
    return check;
  }

  async getWorkspaceTokens(workspaceId: string): Promise<Result<QueueToken[]>> {
    const moduleCheck = await this.assertQueueModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.getWorkspaceTokens(workspaceId);
  }

  async createToken(input: CreateTokenInput): Promise<Result<QueueToken>> {
    const moduleCheck = await this.assertQueueModuleEnabled(input.workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.createToken(input);
  }

  async updateTokenStatus(input: UpdateTokenStatusInput): Promise<Result<boolean>> {
    const moduleCheck = await this.assertQueueModuleEnabled(input.workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.updateTokenStatus(input);
  }
}
