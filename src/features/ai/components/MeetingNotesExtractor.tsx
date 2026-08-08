import { useState, useTransition } from 'react';
import { extractTasksFromNotesAction } from '../actions/ai.actions';
import { createTaskAction } from '@/features/tasks/actions/task.actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AIResultPanel } from './AIResultPanel';
import { ClipboardList, Sparkles, Plus } from 'lucide-react';
import { ExtractedTaskSchema } from '../types';
import { z } from 'zod';

type ExtractedTask = z.infer<typeof ExtractedTaskSchema>;

interface Props {
  workspaceId: string;
}

export function MeetingNotesExtractor({ workspaceId }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isCreatingTasks, startCreateTransition] = useTransition();
  const [notes, setNotes] = useState('');
  const [tasks, setTasks] = useState<ExtractedTask[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleExtract = () => {
    if (!notes.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please paste some meeting notes or discussion logs first.',
        variant: 'destructive',
      });
      return;
    }

    setError(null);
    setTasks([]);
    setSelectedIndices(new Set());

    startTransition(async () => {
      const res = await extractTasksFromNotesAction(workspaceId, notes);
      if (res.error) {
        setError(res.error.message);
        toast({
          title: 'Extraction Failed',
          description: res.error.message,
          variant: 'destructive',
        });
      } else {
        setTasks(res.data.tasks);
        setSelectedIndices(new Set(res.data.tasks.map((_, i) => i)));
        toast({
          title: 'Tasks Extracted',
          description: `Identified ${res.data.tasks.length} potential tasks from the notes.`,
        });
      }
    });
  };

  const handleToggleSelect = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleCreateSelected = () => {
    const selectedTasks = tasks.filter((_, i) => selectedIndices.has(i));
    if (selectedTasks.length === 0) {
      toast({
        title: 'No Tasks Selected',
        description: 'Please check at least one task to import.',
        variant: 'destructive',
      });
      return;
    }

    startCreateTransition(async () => {
      let successCount = 0;
      let failCount = 0;

      for (const t of selectedTasks) {
        const createRes = await createTaskAction({
          workspaceId,
          title: t.title,
          description: t.description,
          priority: t.priority,
          status: 'Todo',
          category: t.category,
          dueDate: t.dueDate || undefined,
        });

        if (createRes.error) {
          failCount++;
        } else {
          successCount++;
        }
      }

      if (failCount === 0) {
        toast({
          title: 'Success!',
          description: `Successfully imported ${successCount} tasks into your dashboard.`,
        });
        setTasks([]);
        setNotes('');
        setSelectedIndices(new Set());
      } else {
        toast({
          title: 'Import Partial Success',
          description: `Created ${successCount} tasks successfully. ${failCount} tasks failed.`,
          variant: 'destructive',
        });
      }
    });
  };

  const handleClear = () => {
    setTasks([]);
    setError(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      {/* Input Notes Area */}
      <div className="bg-card/45 backdrop-blur-md border border-border/40 p-5 rounded-xl flex flex-col justify-between shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/40">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Paste Meeting Notes</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Meeting Transcripts or Discussion Logs</label>
            <Textarea
              placeholder="e.g., Staff meeting notes: John needs to recount the retail shampoo stock by Friday. Reorder gold hair dye. Call the mechanic to service the dentist chair. Sarah will follow up on the bridal party booking details."
              className="min-h-[280px] font-sans text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending || isCreatingTasks}
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
              <span>Limit: 10,000 chars</span>
              <span>{notes.length}/10,000</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleExtract} 
          className="w-full mt-4" 
          disabled={isPending || isCreatingTasks || !notes.trim()}
        >
          {isPending ? (
            <>Extracting Tasks...</>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Extract Tasks
            </>
          )}
        </Button>
      </div>

      {/* Extracted Tasks Output */}
      <div className="h-full min-h-[400px]">
        <AIResultPanel
          title="Extracted Tasks"
          onClear={handleClear}
          isLoading={isPending}
          loadingText="Extracting action items..."
          error={error}
          isEmpty={tasks.length === 0}
          emptyTitle="Task Extractor Ready"
          emptyDescription="Paste meeting transcripts or action notes on the left, then click Extract Tasks to review the structured output."
        >
          <div className="flex flex-col h-full justify-between gap-4">
            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
              <p className="text-xs text-muted-foreground pb-1">
                Select the tasks you want to add to the dashboard:
              </p>
              {tasks.map((task, index) => (
                <div 
                  key={index}
                  onClick={() => !isCreatingTasks && handleToggleSelect(index)}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/10 ${
                    selectedIndices.has(index) 
                      ? 'border-primary/50 bg-primary/5' 
                      : 'border-border/30'
                  }`}
                >
                  <Checkbox
                    checked={selectedIndices.has(index)}
                    onCheckedChange={() => handleToggleSelect(index)}
                    disabled={isCreatingTasks}
                    className="mt-1"
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground truncate block">
                        {task.title}
                      </span>
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority}
                      </Badge>
                      {task.category && (
                        <Badge variant="secondary" className="text-[10px]">
                          {task.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-normal">
                      {task.description}
                    </p>
                    {task.dueDate && (
                      <p className="text-[10px] text-primary font-medium">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleCreateSelected} 
              className="w-full mt-2" 
              disabled={isCreatingTasks || selectedIndices.size === 0}
            >
              {isCreatingTasks ? (
                <>Importing Tasks...</>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add {selectedIndices.size} Selected Tasks
                </>
              )}
            </Button>
          </div>
        </AIResultPanel>
      </div>
    </div>
  );
}
