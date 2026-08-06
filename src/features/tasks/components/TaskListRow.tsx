import { Task } from '../types';
import { StaffMember } from '@/features/staff/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye, Edit, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface TaskListRowProps {
  task: Task;
  staff: StaffMember[];
  isSelected?: boolean;
  onSelect?: (task: Task, selected: boolean) => void;
  onEdit?: (task: Task) => void;
  onView?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (task: Task, newStatus: Task['status']) => void;
  onPriorityChange?: (task: Task, newPriority: Task['priority']) => void;
  onDuplicate?: (task: Task) => void;
  onArchive?: (task: Task) => void;
  onRestore?: (task: Task) => void;
}

export function TaskListRow({
  task,
  staff,
  isSelected,
  onSelect,
  onEdit,
  onView,
  onDelete,
  onStatusChange,
  onPriorityChange,
  onDuplicate,
  onArchive,
  onRestore
}: TaskListRowProps) {
  
  const assignee = staff.find((s) => s.id === task.assigneeId);
  const initials = assignee
    ? assignee.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'In Progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Review': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Blocked': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-border/40 hover:bg-muted/30 transition-colors group bg-card/60">
      {onSelect && (
        <Checkbox 
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(task, checked as boolean)}
        />
      )}
      
      <div 
        className="flex-1 flex items-center gap-4 cursor-pointer min-w-0"
        onClick={() => onView && onView(task)}
      >
        <span className="font-medium text-foreground truncate block flex-1">
          {task.title}
        </span>
        
        <div className="hidden md:flex items-center gap-2 w-32 shrink-0">
          <Badge className={getStatusColor(task.status)} variant="outline">
            {task.status}
          </Badge>
        </div>
        
        <div className="hidden lg:flex items-center gap-2 w-28 shrink-0">
          <Badge className={getPriorityColor(task.priority)} variant="outline">
            {task.priority}
          </Badge>
        </div>
        
        <div className="hidden sm:flex items-center gap-1.5 w-24 shrink-0 text-muted-foreground text-sm">
          {task.dueDate && (
            <>
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </>
          )}
        </div>

        <div className="flex items-center w-8 shrink-0">
          {task.assigneeId && assignee ? (
            <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]" title={assignee.displayName}>
              {initials}
            </div>
          ) : (
            <div className="h-6 w-6 rounded-full border border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground/40" title="Unassigned">
              -
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView && onView(task)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit && onEdit(task)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Task
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {['Todo', 'In Progress', 'Review', 'Completed'].map((s) => (
              <DropdownMenuItem 
                key={s} 
                disabled={task.status === s}
                onClick={() => onStatusChange && onStatusChange(task, s as any)}
              >
                Mark as {s}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            
            {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
              <DropdownMenuItem 
                key={p} 
                disabled={task.priority === p}
                onClick={() => onPriorityChange && onPriorityChange(task, p as any)}
              >
                Set Priority: {p}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {onDuplicate && (
              <DropdownMenuItem onClick={() => onDuplicate(task)}>
                Duplicate Task
              </DropdownMenuItem>
            )}

            {task.isArchived ? (
              onRestore && (
                <DropdownMenuItem onClick={() => onRestore(task)}>
                  Restore Task
                </DropdownMenuItem>
              )
            ) : (
              onArchive && (
                <DropdownMenuItem onClick={() => onArchive(task)}>
                  Archive Task
                </DropdownMenuItem>
              )
            )}

            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => onDelete && onDelete(task)} className="text-destructive focus:text-destructive">
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
