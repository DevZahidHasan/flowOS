'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '../types';
import { deleteTaskAction, updateTaskAction } from '../actions/task.actions';
import { TaskFilters } from './TaskFilters';
import { EmptyTasks } from './EmptyTasks';
import { TaskCard } from './TaskCard';
import { CreateTaskSheet } from './CreateTaskSheet';
import { TaskDetailSheet } from './TaskDetailSheet';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, Plus } from 'lucide-react';

interface Props {
  workspaceId: string;
  workspaceSlug: string;
  initialTasks: Task[];
  isFiltered: boolean;
}

export function TasksDashboardClient({ workspaceId, workspaceSlug, initialTasks, isFiltered }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const handleCreateNew = () => {
    setSelectedTask(null);
    setIsCreateSheetOpen(true);
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsCreateSheetOpen(true);
  };

  const handleView = (task: Task) => {
    setSelectedTask(task);
    setIsDetailSheetOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!taskToDelete) return;
    startTransition(async () => {
      const res = await deleteTaskAction(workspaceId, taskToDelete.id);
      if (res.error) {
        toast({
          title: 'Failed to delete task',
          description: res.error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Task deleted',
          description: `Successfully deleted task.`,
        });
        setTaskToDelete(null);
        router.refresh();
      }
    });
  };

  const handleStatusChange = (task: Task, newStatus: Task['status']) => {
    startTransition(async () => {
      const res = await updateTaskAction({
        workspaceId,
        taskId: task.id,
        status: newStatus
      });
      if (res.error) {
        toast({
          title: 'Failed to update status',
          description: res.error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Status updated',
          description: `Task moved to ${newStatus}.`,
        });
        router.refresh();
      }
    });
  };

  const clearFilters = () => {
    router.push(`/${workspaceSlug}/tasks`);
  };

  return (
    <div className="space-y-8 pb-24 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckSquare className="h-7 w-7 text-primary" />
            Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage, filter, and track all tasks across your workspace.
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="bg-primary text-primary-foreground min-h-[44px] sm:min-h-0 self-start sm:self-center shadow-lg hover:shadow-primary/25 transition-all"
        >
          <Plus className="mr-1.5 h-4 w-4" /> New Task
        </Button>
      </div>

      <TaskFilters />

      {initialTasks.length === 0 ? (
        <EmptyTasks 
          isFiltered={isFiltered}
          onCreateTask={handleCreateNew}
          onClearFilters={clearFilters}
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {initialTasks.map((task) => (
            <TaskCard 
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={setTaskToDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-20 right-6 z-40 sm:hidden">
        <Button
          onClick={handleCreateNew}
          size="icon"
          className="h-14 w-14 rounded-full shadow-xl bg-primary text-primary-foreground hover:shadow-primary/25 transition-all"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <CreateTaskSheet
        workspaceId={workspaceId}
        isOpen={isCreateSheetOpen}
        onClose={() => setIsCreateSheetOpen(false)}
        task={selectedTask}
      />
      
      {selectedTask && (
        <TaskDetailSheet 
          task={selectedTask}
          isOpen={isDetailSheetOpen}
          onClose={() => setIsDetailSheetOpen(false)}
          onEdit={() => handleEdit(selectedTask)}
        />
      )}

      <ConfirmDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        title="Delete Task"
        description={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
        isLoading={isPending}
      />
    </div>
  );
}
