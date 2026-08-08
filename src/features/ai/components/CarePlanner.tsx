import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CarePlannerInputSchema, CarePlannerInput } from '../types';
import { generateCarePlanAction } from '../actions/ai.actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIResultPanel } from './AIResultPanel';
import { Heart, Sparkles } from 'lucide-react';

interface Props {
  workspaceId: string;
}

export function CarePlanner({ workspaceId }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CarePlannerInput>({
    resolver: zodResolver(CarePlannerInputSchema),
    defaultValues: {
      clientName: '',
      treatmentReceived: '',
      conditionDetails: '',
      specialInstructions: '',
      tone: 'caring',
    },
  });

  const onSubmit = (values: CarePlannerInput) => {
    setError(null);
    startTransition(async () => {
      const res = await generateCarePlanAction(workspaceId, values);
      if (res.error) {
        setError(res.error.message);
        toast({
          title: 'Planner Failed',
          description: res.error.message,
          variant: 'destructive',
        });
      } else {
        setResult(res.data);
        toast({
          title: 'Care Plan Drafted',
          description: 'Personalized care instructions have been successfully generated.',
        });
      }
    });
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast({
      title: 'Copied!',
      description: 'Care plan copied to clipboard.',
    });
  };

  const handleClear = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      {/* Input Form */}
      <div className="bg-card/45 backdrop-blur-md border border-border/40 p-5 rounded-xl flex flex-col justify-between shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/40">
              <Heart className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Post-Care Configuration</h3>
            </div>

            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client / Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Smith" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treatmentReceived"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment / Service Received</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Balayage Hair Coloring, Dental Scaling, Brake Pad Replacement" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conditionDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Condition & Observations</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Has sensitive dry scalp; slight bleeding around gums; rotors show light rust but calipers are healthy." 
                      className="min-h-[80px]"
                      {...field} 
                      disabled={isPending} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Requests / Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Recommend organic lavender hair mask, avoid hot water rinse, schedule checkup in 2 weeks." 
                      className="min-h-[80px]"
                      {...field} 
                      disabled={isPending} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Communication Tone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="caring">Warm & Caring</SelectItem>
                      <SelectItem value="professional">Professional & Technical</SelectItem>
                      <SelectItem value="reassuring">Reassuring & Comforting</SelectItem>
                      <SelectItem value="informative">Detailed & Informative</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-4" disabled={isPending}>
              {isPending ? (
                <>Generating Care Plan...</>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Care Plan
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Output Panel */}
      <div className="h-full min-h-[400px]">
        <AIResultPanel
          title="Generated Care Guide"
          onCopy={handleCopy}
          onRegenerate={form.handleSubmit(onSubmit)}
          onClear={handleClear}
          isLoading={isPending}
          loadingText="Writing care instructions..."
          error={error}
          isEmpty={!result}
          emptyTitle="Care & Follow-up Planner"
          emptyDescription="Enter the service received and customer observations to generate customized home-care guides, warnings, and follow-up schedules."
        >
          <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground select-text max-w-none">
            {result}
          </div>
        </AIResultPanel>
      </div>
    </div>
  );
}
