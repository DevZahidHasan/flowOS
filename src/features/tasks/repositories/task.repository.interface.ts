import { Result } from '@/lib/result/result';
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '../types';

export interface ITaskRepository {
  getWorkspaceTasks(filters: TaskFilters): Promise<Result<Task[]>>;
  getTaskStatistics(workspaceId: string): Promise<Result<import('../types').TaskStatistics>>;

  getTaskById(workspaceId: string, taskId: string): Promise<Result<Task>>;
  createTask(input: CreateTaskInput): Promise<Result<Task>>;
  updateTask(input: UpdateTaskInput): Promise<Result<Task>>;
  deleteTask(workspaceId: string, taskId: string): Promise<Result<boolean>>;
}
