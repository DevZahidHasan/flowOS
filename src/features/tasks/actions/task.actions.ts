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
