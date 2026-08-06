'use client';

import { Task } from '../types';
import { StaffMember } from '@/features/staff/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Edit, Paperclip, MessageSquare, ListTodo, Activity, Tag } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: (task: Task) => void;
  staff: StaffMember[];
}

export function TaskDetailSheet({ isOpen, onClose, task, onEdit, staff }: Props) {
  if (!task) return null;

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
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="sm:max-w-[600px] w-full p-0 flex flex-col h-full bg-card/95 backdrop-blur-md">
        
        <SheetHeader className="p-6 border-b border-border/40 shrink-0">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-3 w-full">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs uppercase tracking-wider">{task.status}</Badge>
                <Badge variant="outline" className="text-xs uppercase tracking-wider">{task.priority}</Badge>
                {overdue && <Badge variant="outline" className="text-xs uppercase tracking-wider text-red-500 border-red-500/30 bg-red-500/10">Overdue</Badge>}
              </div>
              <SheetTitle className="text-2xl font-bold leading-tight">{task.title}</SheetTitle>
              {task.category && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>{task.category}</span>
                </div>
              )}
              {task.labels && task.labels.length > 0 && (
                <div className="flex gap-2 flex-wrap pt-1">
                  {task.labels.map(l => (
                    <Badge key={l} variant="secondary" className="text-xs font-normal">{l}</Badge>
                  ))}
                </div>
              )}
            </div>
            <Button variant="outline" size="icon" onClick={() => { onClose(); onEdit(task); }} className="shrink-0 h-9 w-9">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8">
            
            {/* Description Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Description</h4>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {task.description || <span className="italic opacity-50">No description provided.</span>}
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Due Date
                </div>
                <div className={`text-sm ${overdue ? 'text-red-500 font-medium' : 'text-foreground'}`}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Estimated / Actual
                </div>
                <div className="text-sm text-foreground">
                  {task.actualHours}h / {task.estimatedHours}h
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assignee</div>
                <div className="flex items-center gap-2">
                  {task.assigneeId && assignee ? (
                    <>
                      <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]" title={assignee.displayName}>
                        {initials}
                      </div>
                      <span className="text-sm text-foreground">{assignee.displayName}</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Unassigned</span>
                  )}
                </div>
              </div>
              
              </div>
              
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mt-6">Timeline</h4>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 mt-3">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created On</div>
                  <div className="text-sm text-foreground">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Updated On</div>
                  <div className="text-sm text-foreground">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

            <Separator className="bg-border/40 my-6" />

            {/* Future Architecture Placeholders */}
            <div className="space-y-6 opacity-60">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Extensions (Coming Soon)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start gap-2 h-12 bg-card/50" disabled>
                  <MessageSquare className="h-4 w-4" />
                  <span>Comments (0)</span>
                </Button>
                <Button variant="outline" className="justify-start gap-2 h-12 bg-card/50" disabled>
                  <ListTodo className="h-4 w-4" />
                  <span>Checklist (0/0)</span>
                </Button>
                <Button variant="outline" className="justify-start gap-2 h-12 bg-card/50" disabled>
                  <Paperclip className="h-4 w-4" />
                  <span>Attachments (0)</span>
                </Button>
                <Button variant="outline" className="justify-start gap-2 h-12 bg-card/50" disabled>
                  <Activity className="h-4 w-4" />
                  <span>Activity Log</span>
                </Button>
              </div>
            </div>

          </div>
        </ScrollArea>
        
      </SheetContent>
    </Sheet>
  );
}
