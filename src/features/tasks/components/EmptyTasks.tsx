import { CheckCircle, Plus, SearchX, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyTasksProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
  onCreateTask?: () => void;
}

export function EmptyTasks({ isFiltered, onClearFilters, onCreateTask }: EmptyTasksProps) {
  return (
    <div className="flex flex-col items-center justify-center p-16 mt-8 border border-border/50 rounded-2xl bg-card/20 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md hover:bg-card/30">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        <div className="relative h-24 w-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          {isFiltered ? (
            <SearchX className="h-12 w-12 text-primary/80" />
          ) : (
            <Inbox className="h-12 w-12 text-primary/80" />
          )}
        </div>
      </div>
      
      <h3 className="text-2xl font-bold tracking-tight text-foreground mb-3 text-center">
        {isFiltered ? 'No matches found' : 'You are all caught up!'}
      </h3>
      
      <p className="text-muted-foreground text-center max-w-md mb-8 text-sm md:text-base leading-relaxed">
        {isFiltered 
          ? "We couldn't find any tasks matching your current filters. Try adjusting your search criteria or clearing filters to see more results."
          : "Your workspace is looking delightfully empty. Create a new task to start organizing your work, setting priorities, and hitting deadlines."}
      </p>
      
      {isFiltered ? (
        <Button onClick={onClearFilters} variant="outline" className="min-h-[44px] px-8 rounded-full shadow-sm hover:shadow">
          Clear All Filters
        </Button>
      ) : (
        <Button onClick={onCreateTask} className="min-h-[44px] px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all group">
          <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" /> 
          Create New Task
        </Button>
      )}
    </div>
  );
}
