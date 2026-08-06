'use server';

import { TaskService } from '../services/task.service';
import { TaskRepository } from '../repositories/task.repository';
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const taskRepository = new TaskRepository();
const taskService = new TaskService(taskRepository);

export async function getTasksAction(filters: TaskFilters): Promise<Result<Task[]>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return taskService.getWorkspaceTasks(filters);
}

export async function getTaskByIdAction(workspaceId: string, taskId: string): Promise<Result<Task>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return taskService.getTaskById(workspaceId, taskId);
}

export async function getTaskStatisticsAction(workspaceId: string): Promise<Result<import('../types').TaskStatistics>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return taskService.getTaskStatistics(workspaceId);
}

export async function createTaskAction(input: CreateTaskInput): Promise<Result<Task>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return taskService.createTask({ ...input, createdBy: user.id });
}

export async function updateTaskAction(input: UpdateTaskInput): Promise<Result<Task>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return taskService.updateTask(input);
}

export async function deleteTaskAction(workspaceId: string, taskId: string): Promise<Result<boolean>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return fail(AppErrorFactory.unauthorized('Authentication required'));
  }

  return taskService.deleteTask(workspaceId, taskId);
}

export async function duplicateTaskAction(workspaceId: string, taskId: string): Promise<Result<Task>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return fail(AppErrorFactory.unauthorized('Authentication required'));

  return taskService.duplicateTask(workspaceId, taskId);
}

export async function archiveTaskAction(workspaceId: string, taskId: string): Promise<Result<Task>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return fail(AppErrorFactory.unauthorized('Authentication required'));

  return taskService.archiveTask(workspaceId, taskId);
}

export async function restoreTaskAction(workspaceId: string, taskId: string): Promise<Result<Task>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return fail(AppErrorFactory.unauthorized('Authentication required'));

  return taskService.restoreTask(workspaceId, taskId);
}

// Bulk Actions
export async function bulkCompleteTasksAction(workspaceId: string, taskIds: string[]): Promise<Result<boolean>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail(AppErrorFactory.unauthorized('Authentication required'));

  const promises = taskIds.map(id => taskService.updateTask({ workspaceId, taskId: id, status: 'Completed' }));
  await Promise.all(promises);
  return { error: null, data: true };
}

export async function bulkArchiveTasksAction(workspaceId: string, taskIds: string[]): Promise<Result<boolean>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail(AppErrorFactory.unauthorized('Authentication required'));

  const promises = taskIds.map(id => taskService.archiveTask(workspaceId, id));
  await Promise.all(promises);
  return { error: null, data: true };
}

export async function bulkDeleteTasksAction(workspaceId: string, taskIds: string[]): Promise<Result<boolean>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail(AppErrorFactory.unauthorized('Authentication required'));

  const promises = taskIds.map(id => taskService.deleteTask(workspaceId, id));
  await Promise.all(promises);
  return { error: null, data: true };
}

export async function bulkUpdatePriorityAction(workspaceId: string, taskIds: string[], priority: import('../types').TaskPriority): Promise<Result<boolean>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail(AppErrorFactory.unauthorized('Authentication required'));

  const promises = taskIds.map(id => taskService.updateTask({ workspaceId, taskId: id, priority }));
  await Promise.all(promises);
  return { error: null, data: true };
}

export async function bulkUpdateCategoryAction(workspaceId: string, taskIds: string[], category: import('../types').TaskCategory): Promise<Result<boolean>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail(AppErrorFactory.unauthorized('Authentication required'));

  const promises = taskIds.map(id => taskService.updateTask({ workspaceId, taskId: id, category }));
  await Promise.all(promises);
  return { error: null, data: true };
}
