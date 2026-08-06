import { Task } from '../types';
import { Button } from '@/components/ui/button';
import { CheckSquare, Trash2, Archive, Copy, Tag, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  selectedTasks: Task[];
  onClearSelection: () => void;
  onBulkComplete: () => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  onBulkPriority: (priority: Task['priority']) => void;
}

export function TaskBulkActionBar({
  selectedTasks,
  onClearSelection,
  onBulkComplete,
  onBulkArchive,
  onBulkDelete,
  onBulkPriority,
}: Props) {
  if (selectedTasks.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-card border border-border shadow-xl rounded-full">
      <div className="flex items-center gap-2 pr-4 border-r border-border">
        <span className="text-sm font-medium whitespace-nowrap bg-primary/20 text-primary px-2.5 py-0.5 rounded-full">
          {selectedTasks.length} selected
        </span>
        <Button variant="ghost" size="icon" onClick={onClearSelection} className="h-7 w-7 rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-1 pl-2">
        <Button variant="ghost" size="sm" onClick={onBulkComplete} className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10">
          <CheckSquare className="h-4 w-4 mr-2" />
          Complete
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Tag className="h-4 w-4 mr-2" />
              Priority
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {['Low', 'Medium', 'High', 'Urgent'].map(p => (
              <DropdownMenuItem key={p} onClick={() => onBulkPriority(p as any)}>
                {p}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" onClick={onBulkArchive}>
          <Archive className="h-4 w-4 mr-2" />
          Archive
        </Button>

        <Button variant="ghost" size="sm" onClick={onBulkDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}
