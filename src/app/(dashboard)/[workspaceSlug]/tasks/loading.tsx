import { TaskSkeleton } from '@/features/tasks/components/TaskSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckSquare } from 'lucide-react';

export default function TasksLoading() {
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
        <Skeleton className="h-11 w-32" />
      </div>

      {/* KPI Skeletons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>

      {/* Filter Skeleton */}
      <Skeleton className="h-16 w-full rounded-xl" />

      {/* Grid Skeleton */}
      <TaskSkeleton />
    </div>
  );
}
