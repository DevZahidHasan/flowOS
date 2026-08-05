import { CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface EmptyTasksProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
  onCreateTask?: () => void;
}

export function EmptyTasks({ isFiltered, onClearFilters, onCreateTask }: EmptyTasksProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 mt-8 border border-dashed rounded-xl bg-card/30 border-border">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <CheckCircle className="h-10 w-10 text-primary" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">
        {isFiltered ? 'No tasks found' : 'You are all caught up!'}
      </h3>
      
      <p className="text-muted-foreground text-center max-w-sm mb-8">
        {isFiltered 
          ? 'No tasks match your current filters. Try adjusting your search or clearing filters.' 
          : 'Create a new task to start organizing your work, setting priorities, and hitting deadlines.'}
      </p>
      
      {isFiltered ? (
        <Button onClick={onClearFilters} variant="outline" className="min-h-[44px]">
          Clear Filters
        </Button>
      ) : (
        <Button onClick={onCreateTask} className="min-h-[44px]">
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      )}
    </div>
  );
}
