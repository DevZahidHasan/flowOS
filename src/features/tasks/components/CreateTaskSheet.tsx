'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task, TaskCategory } from '../types';
import { createTaskAction, updateTaskAction } from '../actions/task.actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['Todo', 'In Progress', 'Blocked', 'Review', 'Completed']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  category: z.string().optional(),
  labels: z.string().optional(),
  assigneeId: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
  dueDate: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface Props {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;

}

export function CreateTaskSheet({ workspaceId, isOpen, onClose, task }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = !!task;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'Todo',
      priority: 'Medium',
      category: 'unassigned',
      labels: '',
      assigneeId: 'unassigned',
      estimatedHours: 0,
      actualHours: 0,
      dueDate: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (task) {
        form.reset({
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          category: task.category || 'unassigned',
          labels: task.labels ? task.labels.join(', ') : '',
          assigneeId: task.assigneeId || 'unassigned',
          estimatedHours: task.estimatedHours || 0,
          actualHours: task.actualHours || 0,
          dueDate: task.dueDate || '',
        });
      } else {
        form.reset({
          title: '',
          description: '',
          status: 'Todo',
          priority: 'Medium',
          category: 'unassigned',
          labels: '',
          assigneeId: 'unassigned',
          estimatedHours: 0,
          actualHours: 0,
          dueDate: '',
        });
      }
    }
  }, [isOpen, task, form]);

  const onSubmit = (values: TaskFormValues) => {
    startTransition(async () => {
      const cat = values.category === 'unassigned' ? null : (values.category as TaskCategory);
      const labelsArray = values.labels ? values.labels.split(',').map(s => s.trim()).filter(Boolean) : [];
      const aId = values.assigneeId === 'unassigned' ? null : values.assigneeId;

      if (isEdit) {
        const res = await updateTaskAction({
          workspaceId,
          taskId: task.id,
          title: values.title,
          description: values.description || null,
          status: values.status,
          priority: values.priority,
          category: cat,
          labels: labelsArray,
          assigneeId: aId,
          estimatedHours: values.estimatedHours,
          actualHours: values.actualHours,
          dueDate: values.dueDate || null,
        });

        if (res.error) {
          toast({
            title: 'Failed to update task',
            description: res.error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Task updated',
            description: 'Task changes saved successfully.',
          });
          onClose();
          router.refresh();
        }
      } else {
        const res = await createTaskAction({
          workspaceId,
          title: values.title,
          description: values.description || null,
          status: values.status,
          priority: values.priority,
          category: cat,
          labels: labelsArray,
          assigneeId: aId,
          estimatedHours: values.estimatedHours,
          dueDate: values.dueDate || null,
        });

        if (res.error) {
          toast({
            title: 'Failed to create task',
            description: res.error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Task created',
            description: 'New task has been created successfully.',
          });
          onClose();
          router.refresh();
        }
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-[500px] w-full">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Task' : 'New Task'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Update the details for this task.' : 'Add a new task to your workspace.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6 pb-20">
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Design new landing page" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any extra details here..." 
                      className="min-h-[100px]"
                      {...field} 
                      disabled={isPending} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Todo">Todo</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Review">Review</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">None</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Cleaning">Cleaning</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="labels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Labels (Comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="urgent, client, followup" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Est. Hours (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.5"
                        min="0"
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        disabled={isPending} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {isEdit && (
              <FormField
                control={form.control}
                name="actualHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Hours Logged</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.5"
                        min="0"
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        disabled={isPending} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <SheetFooter className="absolute bottom-0 left-0 w-full p-4 bg-background border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Task'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
