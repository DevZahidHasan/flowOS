import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { ITaskRepository } from '../repositories/task.repository.interface';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '../types';

export class TaskService {
  private readonly workspaceService: WorkspaceService;

  constructor(
    private readonly taskRepo: ITaskRepository,
    workspaceService?: WorkspaceService
  ) {
    this.workspaceService = workspaceService || new WorkspaceService();
  }

  private async assertTasksModuleEnabled(workspaceId: string): Promise<Result<boolean>> {
    const check = await this.workspaceService.isModuleEnabled(workspaceId, 'tasks');
    if (check.error) return fail(check.error);
    if (!check.data) {
      return fail(AppErrorFactory.forbidden('Tasks module is disabled for this workspace. Enable it in Settings.', 'MODULE_DISABLED'));
    }
    return check;
  }

  private validateDueDate(dueDateStr?: string | null): Result<boolean> {
    if (!dueDateStr) return ok(true);
    const d = new Date(dueDateStr);
    if (isNaN(d.getTime())) {
      return fail(AppErrorFactory.badRequest('Invalid due date format', 'INVALID_DATE'));
    }
    return ok(true);
  }

  async getWorkspaceTasks(filters: TaskFilters): Promise<Result<Task[]>> {
    const moduleCheck = await this.assertTasksModuleEnabled(filters.workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);
    
    return this.taskRepo.getWorkspaceTasks(filters);
  }

  async getTaskById(workspaceId: string, taskId: string): Promise<Result<Task>> {
    const moduleCheck = await this.assertTasksModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.taskRepo.getTaskById(workspaceId, taskId);
  }

  async getTaskStatistics(workspaceId: string): Promise<Result<import('../types').TaskStatistics>> {
    const moduleCheck = await this.assertTasksModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.taskRepo.getTaskStatistics(workspaceId);
  }

  async createTask(input: CreateTaskInput): Promise<Result<Task>> {
    const moduleCheck = await this.assertTasksModuleEnabled(input.workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    if (!input.title || !input.title.trim()) {
      return fail(AppErrorFactory.badRequest('Task title is required', 'MISSING_TASK_TITLE'));
    }

    const dateCheck = this.validateDueDate(input.dueDate);
    if (dateCheck.error) return fail(dateCheck.error);

    // In a real scenario, you'd also validate assigneeId against staff repository.

    return this.taskRepo.createTask(input);
  }

  async updateTask(input: UpdateTaskInput): Promise<Result<Task>> {
    const moduleCheck = await this.assertTasksModuleEnabled(input.workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    if (input.title !== undefined && !input.title.trim()) {
      return fail(AppErrorFactory.badRequest('Task title cannot be empty', 'INVALID_TASK_TITLE'));
    }

    const dateCheck = this.validateDueDate(input.dueDate);
    if (dateCheck.error) return fail(dateCheck.error);

    return this.taskRepo.updateTask(input);
  }

  async deleteTask(workspaceId: string, taskId: string): Promise<Result<boolean>> {
    const moduleCheck = await this.assertTasksModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.taskRepo.deleteTask(workspaceId, taskId);
  }

  async duplicateTask(workspaceId: string, taskId: string): Promise<Result<Task>> {
    const moduleCheck = await this.assertTasksModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    const taskResult = await this.taskRepo.getTaskById(workspaceId, taskId);
    if (taskResult.error) return fail(taskResult.error);

    const task = taskResult.data;
    const input: CreateTaskInput = {
      workspaceId: task.workspaceId,
      title: `${task.title} (Copy)`,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category: task.category,
      labels: task.labels,
      assigneeId: task.assigneeId,
      estimatedHours: task.estimatedHours,
      dueDate: task.dueDate,
      createdBy: task.createdBy,
    };

    return this.taskRepo.createTask(input);
  }

  async archiveTask(workspaceId: string, taskId: string): Promise<Result<Task>> {
    const moduleCheck = await this.assertTasksModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.taskRepo.updateTask({
      workspaceId,
      taskId,
      isArchived: true
    });
  }

  async restoreTask(workspaceId: string, taskId: string): Promise<Result<Task>> {
    const moduleCheck = await this.assertTasksModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.taskRepo.updateTask({
      workspaceId,
      taskId,
      isArchived: false
    });
  }
}
