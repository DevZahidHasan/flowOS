import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Result, ok, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';
import { ITaskRepository } from './task.repository.interface';
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '../types';
import type { Database } from '@/types/database';

type DBTask = Database['public']['Tables']['tasks']['Row'];

function mapTaskRow(r: DBTask): Task {
  return {
    id: r.id,
    workspaceId: r.workspace_id,
    category: r.category as Task['category'],
    labels: r.labels || [],
    title: r.title,
    description: r.description,
    status: r.status as Task['status'],
    priority: r.priority as Task['priority'],
    assigneeId: r.assignee_id,
    estimatedHours: Number(r.estimated_hours),
    actualHours: Number(r.actual_hours),
    dueDate: r.due_date,
    orderIndex: r.order_index,
    completedAt: r.completed_at,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at,
    isArchived: r.is_archived,
  };
}

export class TaskRepository implements ITaskRepository {
  async getWorkspaceTasks(filters: TaskFilters): Promise<Result<Task[]>> {
    try {
      const supabase = await createServerSupabaseClient();
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('workspace_id', filters.workspaceId);
        
      if (filters.trash) {
        query = query.not('deleted_at', 'is', null);
      } else if (filters.archived) {
        query = query.eq('is_archived', true).is('deleted_at', null);
      } else {
        query = query.eq('is_archived', false).is('deleted_at', null);
      }

      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.assigneeId) {
        query = query.eq('assignee_id', filters.assigneeId);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.labels && filters.labels.length > 0) {
        query = query.contains('labels', filters.labels);
      }
      
      // Due date filter (exact match, or you could do ranges. let's assume exact match for now)
      if (filters.dueDate) {
        query = query.eq('due_date', filters.dueDate);
      }

      // Overdue filter
      if (filters.overdue) {
        const today = new Date().toISOString().split('T')[0];
        query = query.lt('due_date', today).neq('status', 'Completed');
      }

      if (filters.sort) {
        const [field, order] = filters.sort.split(':');
        query = query.order(field as any, { ascending: order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'TASKS_FETCH_FAILED'));
      }

      const rows = (data || []) as unknown as DBTask[];
      return ok(rows.map(mapTaskRow));
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }
  async getTaskStatistics(workspaceId: string): Promise<Result<import('../types').TaskStatistics>> {
    try {
      const supabase = await createServerSupabaseClient();
      
      const { data, error } = await supabase
        .from('tasks')
        .select('status, due_date')
        .eq('workspace_id', workspaceId)
        .eq('is_archived', false)
        .is('deleted_at', null);

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'TASK_STATS_FAILED'));
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = {
        totalCount: data.length,
        completedCount: 0,
        overdueCount: 0,
        todoCount: 0,
        inProgressCount: 0,
      };

      data.forEach(task => {
        if (task.status === 'Completed') {
          stats.completedCount++;
        } else {
          if (task.status === 'Todo') stats.todoCount++;
          if (task.status === 'In Progress') stats.inProgressCount++;
          
          if (task.due_date) {
            const due = new Date(task.due_date);
            if (due < today) {
              stats.overdueCount++;
            }
          }
        }
      });

      return ok(stats);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }


  async getTaskById(workspaceId: string, taskId: string): Promise<Result<Task>> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('id', taskId)
        .single();

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'TASK_FETCH_FAILED'));
      }
      if (!data) {
        return fail(AppErrorFactory.notFound('Task not found'));
      }

      return ok(mapTaskRow(data as unknown as DBTask));
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async createTask(input: CreateTaskInput): Promise<Result<Task>> {
    try {
      const supabase = await createServerSupabaseClient();
      
      const insertPayload = {
        workspace_id: input.workspaceId,
        category: input.category || null,
        labels: input.labels || [],
        title: input.title,
        description: input.description || null,
        status: input.status || 'Todo',
        priority: input.priority || 'Medium',
        assignee_id: input.assigneeId || null,
        estimated_hours: input.estimatedHours || 0,
        due_date: input.dueDate || null,
        created_by: input.createdBy,
        order_index: 0,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(insertPayload as never)
        .select()
        .single();

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'TASK_CREATE_FAILED'));
      }

      return ok(mapTaskRow(data as unknown as DBTask));
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async updateTask(input: UpdateTaskInput): Promise<Result<Task>> {
    try {
      const supabase = await createServerSupabaseClient();
      
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (input.category !== undefined) updatePayload.category = input.category;
      if (input.labels !== undefined) updatePayload.labels = input.labels;
      if (input.title !== undefined) updatePayload.title = input.title;
      if (input.description !== undefined) updatePayload.description = input.description;
      if (input.status !== undefined) {
        updatePayload.status = input.status;
        if (input.status === 'Completed') {
          updatePayload.completed_at = new Date().toISOString();
        } else {
          updatePayload.completed_at = null;
        }
      }
      if (input.priority !== undefined) updatePayload.priority = input.priority;
      if (input.assigneeId !== undefined) updatePayload.assignee_id = input.assigneeId;
      if (input.estimatedHours !== undefined) updatePayload.estimated_hours = input.estimatedHours;
      if (input.actualHours !== undefined) updatePayload.actual_hours = input.actualHours;
      if (input.dueDate !== undefined) updatePayload.due_date = input.dueDate;
      if (input.orderIndex !== undefined) updatePayload.order_index = input.orderIndex;
      if (input.isArchived !== undefined) updatePayload.is_archived = input.isArchived;

      const { data, error } = await supabase
        .from('tasks')
        .update(updatePayload as never)
        .eq('workspace_id', input.workspaceId)
        .eq('id', input.taskId)
        .select()
        .single();

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'TASK_UPDATE_FAILED'));
      }
      if (!data) {
        return fail(AppErrorFactory.notFound('Task not found'));
      }

      return ok(mapTaskRow(data as unknown as DBTask));
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }

  async deleteTask(workspaceId: string, taskId: string): Promise<Result<boolean>> {
    try {
      const supabase = await createServerSupabaseClient();
      
      const { error } = await supabase
        .from('tasks')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('workspace_id', workspaceId)
        .eq('id', taskId);

      if (error) {
        return fail(AppErrorFactory.internal(error.message, 'TASK_DELETE_FAILED'));
      }

      return ok(true);
    } catch (err) {
      return fail(AppErrorFactory.fromUnknown(err));
    }
  }
}
