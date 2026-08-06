import { Task } from '../types';
import { StaffMember } from '@/features/staff/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Edit, Eye, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  staff: StaffMember[];
  onEdit?: (task: Task) => void;
  onView?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (task: Task, newStatus: Task['status']) => void;
  onPriorityChange?: (task: Task, newPriority: Task['priority']) => void;
  onDuplicate?: (task: Task) => void;
  onArchive?: (task: Task) => void;
  onRestore?: (task: Task) => void;
}

export function TaskCard({ task, staff, onEdit, onView, onDelete, onStatusChange, onPriorityChange, onDuplicate, onArchive, onRestore }: TaskCardProps) {
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'High':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Medium':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Review':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Blocked':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const isOverdue = () => {
    if (task.status === 'Completed' || !task.dueDate) return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  };

  const assignee = staff.find((s) => s.id === task.assigneeId);
  const initials = assignee
    ? assignee.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const overdue = isOverdue();

  return (
    <Card className="bg-card/60 backdrop-blur-sm text-card-foreground border-border/40 hover:border-border/80 hover:shadow-md transition-all group">
      <CardContent className="p-5 flex flex-col h-full relative cursor-pointer" onClick={() => onView && onView(task)}>
        
        {/* Header (Title + Actions) */}
        <div className="flex justify-between items-start mb-3 gap-4">
          <div className="space-y-1.5 flex-1">
            <h3 className="font-semibold text-base text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {task.title}
            </h3>
          </div>
          
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
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
                
                {/* Status Submenu / Items */}
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

                {/* Priority */}
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

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={getPriorityColor(task.priority)} variant="outline">
            {task.priority}
          </Badge>
          <Badge className={getStatusColor(task.status)} variant="outline">
            {task.status}
          </Badge>
          {overdue && (
            <Badge className="bg-red-500/10 text-red-500 border-red-500/20" variant="outline">
              Overdue
            </Badge>
          )}
        </div>

        {/* Description Snippet */}
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
            {task.description}
          </p>
        )}
        {!task.description && <div className="flex-grow" />}

        {/* Metadata Footer */}
        <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap justify-between items-center gap-2 text-xs text-muted-foreground">
          
          <div className="flex items-center gap-4">
            {task.dueDate && (
              <div className={`flex items-center gap-1.5 ${overdue ? 'text-red-500' : ''}`}>
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            
            {(task.estimatedHours > 0 || task.actualHours > 0) && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{task.actualHours} / {task.estimatedHours}h</span>
              </div>
            )}
            
            {task.category && (
               <div className="flex items-center gap-1.5" title="Category">
                 <Badge variant="outline" className="text-[10px] py-0">{task.category}</Badge>
               </div>
            )}
          </div>

          {task.labels && task.labels.length > 0 && (
             <div className="flex gap-1 flex-wrap mt-2 w-full">
               {task.labels.map(label => (
                 <Badge key={label} variant="secondary" className="text-[9px] py-0">{label}</Badge>
               ))}
             </div>
          )}

          <div className="flex items-center w-full justify-end mt-2">
            {task.assigneeId && assignee ? (
              <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]" title={assignee.displayName}>
                 {initials}
              </div>
            ) : (
              <span className="text-[10px] uppercase tracking-wider opacity-60">Unassigned</span>
            )}
          </div>

        </div>

      </CardContent>
    </Card>
  );
}
