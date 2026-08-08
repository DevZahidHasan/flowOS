'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task, TaskStatistics } from '../types';
import { StaffMember } from '@/features/staff/types';
import { 
  deleteTaskAction, updateTaskAction, duplicateTaskAction, 
  archiveTaskAction, restoreTaskAction,
  bulkCompleteTasksAction, bulkArchiveTasksAction, bulkDeleteTasksAction,
  bulkUpdatePriorityAction, bulkUpdateCategoryAction
} from '../actions/task.actions';
import { TaskFilters } from './TaskFilters';
import { EmptyTasks } from './EmptyTasks';
import { TaskCard } from './TaskCard';
import { TaskListRow } from './TaskListRow';
import { TaskBulkActionBar } from './TaskBulkActionBar';
import { CreateTaskSheet } from './CreateTaskSheet';
import { TaskDetailSheet } from './TaskDetailSheet';
import { TaskKPIs } from './TaskKPIs';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, Plus, LayoutGrid, List, Columns, Calendar as CalendarIcon, GitMerge } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface Props {
  workspaceId: string;
  workspaceSlug: string;
  initialTasks: Task[];
  initialStats: TaskStatistics | null;
  initialStaff: StaffMember[];
  isFiltered: boolean;
}

export function TasksDashboardClient({ 
  workspaceId, 
  workspaceSlug, 
  initialTasks, 
  initialStats,
  initialStaff,
  isFiltered 
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('flowOS_task_view_mode');
    if (saved === 'list' || saved === 'card') {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (val: string) => {
    if (val === 'card' || val === 'list') {
      setViewMode(val);
      localStorage.setItem('flowOS_task_view_mode', val);
    }
  };

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
        toast({ title: 'Failed to delete task', description: res.error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Task deleted', description: `Successfully deleted task.` });
        setTaskToDelete(null);
        setSelectedTaskIds(prev => {
          const next = new Set(prev);
          next.delete(taskToDelete.id);
          return next;
        });
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
        toast({ title: 'Failed to update status', description: res.error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Status updated', description: `Task moved to ${newStatus}.` });
        router.refresh();
      }
    });
  };

  const handlePriorityChange = (task: Task, newPriority: Task['priority']) => {
    startTransition(async () => {
      const res = await updateTaskAction({ workspaceId, taskId: task.id, priority: newPriority });
      if (res.error) toast({ title: 'Failed to update priority', description: res.error.message, variant: 'destructive' });
      else { toast({ title: 'Priority updated' }); router.refresh(); }
    });
  };

  const handleDuplicate = (task: Task) => {
    startTransition(async () => {
      const res = await duplicateTaskAction(workspaceId, task.id);
      if (res.error) toast({ title: 'Failed to duplicate task', description: res.error.message, variant: 'destructive' });
      else { toast({ title: 'Task duplicated' }); router.refresh(); }
    });
  };

  const handleArchive = (task: Task) => {
    startTransition(async () => {
      const res = await archiveTaskAction(workspaceId, task.id);
      if (res.error) toast({ title: 'Failed to archive task', description: res.error.message, variant: 'destructive' });
      else { toast({ title: 'Task archived' }); router.refresh(); }
    });
  };

  const handleRestore = (task: Task) => {
    startTransition(async () => {
      const res = await restoreTaskAction(workspaceId, task.id);
      if (res.error) toast({ title: 'Failed to restore task', description: res.error.message, variant: 'destructive' });
      else { toast({ title: 'Task restored' }); router.refresh(); }
    });
  };

  const handleSelect = (task: Task, selected: boolean) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (selected) next.add(task.id);
      else next.delete(task.id);
      return next;
    });
  };

  // Bulk Handlers
  const selectedTasksArr = initialTasks.filter(t => selectedTaskIds.has(t.id));
  
  const handleBulkComplete = () => {
    startTransition(async () => {
      await bulkCompleteTasksAction(workspaceId, Array.from(selectedTaskIds));
      toast({ title: 'Tasks completed' });
      setSelectedTaskIds(new Set());
      router.refresh();
    });
  };
  const handleBulkArchive = () => {
    startTransition(async () => {
      await bulkArchiveTasksAction(workspaceId, Array.from(selectedTaskIds));
      toast({ title: 'Tasks archived' });
      setSelectedTaskIds(new Set());
      router.refresh();
    });
  };
  const handleBulkDelete = () => {
    startTransition(async () => {
      await bulkDeleteTasksAction(workspaceId, Array.from(selectedTaskIds));
      toast({ title: 'Tasks deleted' });
      setSelectedTaskIds(new Set());
      router.refresh();
    });
  };
  const handleBulkPriority = (priority: Task['priority']) => {
    startTransition(async () => {
      await bulkUpdatePriorityAction(workspaceId, Array.from(selectedTaskIds), priority);
      toast({ title: `Priority updated to ${priority}` });
      setSelectedTaskIds(new Set());
      router.refresh();
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
        
        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange} className="bg-muted/50 p-1 rounded-md">
            <ToggleGroupItem value="card" aria-label="Card View" title="Card View" className="h-9 px-2.5">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List View" title="List View" className="h-9 px-2.5">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="kanban" aria-label="Kanban View" title="Kanban (Coming soon)" disabled className="h-9 px-2.5 opacity-40">
              <Columns className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="calendar" aria-label="Calendar View" title="Calendar (Coming soon)" disabled className="h-9 px-2.5 opacity-40">
              <CalendarIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="timeline" aria-label="Timeline View" title="Timeline (Coming soon)" disabled className="h-9 px-2.5 opacity-40">
              <GitMerge className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Button
            onClick={handleCreateNew}
            className="bg-primary text-primary-foreground min-h-[44px] sm:min-h-0 shadow-lg hover:shadow-primary/25 transition-all"
          >
            <Plus className="mr-1.5 h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      <TaskKPIs stats={initialStats} />

      <TaskFilters />

      {initialTasks.length === 0 ? (
        <EmptyTasks 
          isFiltered={isFiltered}
          onCreateTask={handleCreateNew}
          onClearFilters={clearFilters}
        />
      ) : (
        <>
          {viewMode === 'card' ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {initialTasks.map((task) => (
                <TaskCard 
                  key={task.id}
                  task={task}
                  staff={initialStaff}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={setTaskToDelete}
                  onStatusChange={handleStatusChange}
                  onPriorityChange={handlePriorityChange}
                  onDuplicate={handleDuplicate}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col border border-border/60 rounded-lg overflow-hidden">
              {initialTasks.map((task) => (
                <TaskListRow 
                  key={task.id}
                  task={task}
                  staff={initialStaff}
                  isSelected={selectedTaskIds.has(task.id)}
                  onSelect={handleSelect}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={setTaskToDelete}
                  onStatusChange={handleStatusChange}
                  onPriorityChange={handlePriorityChange}
                  onDuplicate={handleDuplicate}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                />
              ))}
            </div>
          )}
        </>
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

      <TaskBulkActionBar 
        selectedTasks={selectedTasksArr}
        onClearSelection={() => setSelectedTaskIds(new Set())}
        onBulkComplete={handleBulkComplete}
        onBulkArchive={handleBulkArchive}
        onBulkDelete={handleBulkDelete}
        onBulkPriority={handleBulkPriority}
      />

      <CreateTaskSheet
        workspaceId={workspaceId}
        isOpen={isCreateSheetOpen}
        onClose={() => setIsCreateSheetOpen(false)}
        task={selectedTask}
        staff={initialStaff}
      />
      
      {selectedTask && (
        <TaskDetailSheet 
          task={selectedTask}
          staff={initialStaff}
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
