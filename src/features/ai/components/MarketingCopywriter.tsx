import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MarketingInputSchema, MarketingInput, MarketingOutput } from '../types';
import { generateMarketingCopyAction } from '../actions/ai.actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AIResultPanel } from './AIResultPanel';
import { Megaphone, Sparkles, Send, Tag } from 'lucide-react';

interface Props {
  workspaceId: string;
}

export function MarketingCopywriter({ workspaceId }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<MarketingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<MarketingInput>({
    resolver: zodResolver(MarketingInputSchema),
    defaultValues: {
      productName: '',
      description: '',
      offerDiscount: '',
      targetAudience: '',
      platform: 'Instagram',
      tone: 'engaging',
      length: 'medium',
    },
  });

  const onSubmit = (values: MarketingInput) => {
    setError(null);
    startTransition(async () => {
      const res = await generateMarketingCopyAction(workspaceId, values);
      if (res.error) {
        setError(res.error.message);
        toast({
          title: 'Copywriter Generation Failed',
          description: res.error.message,
          variant: 'destructive',
        });
      } else {
        setResult(res.data);
        toast({
          title: 'Copy Drafted!',
          description: 'Your marketing copy is ready to copy or edit.',
        });
      }
    });
  };

  const handleCopy = () => {
    if (!result) return;
    const formatted = `${result.mainCopy}\n\n${result.cta}\n\n${result.hashtags.join(' ')}${result.shortVariation ? `\n\nShort Version:\n${result.shortVariation}` : ''}`;
    navigator.clipboard.writeText(formatted);
    toast({
      title: 'Copied!',
      description: 'Full copy template copied to clipboard.',
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
              <Megaphone className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Copywriter Settings</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product / Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Deluxe Hair Spa" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offerDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer / Discount (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 20% off this weekend" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., busy working professionals, salon owners" {...field} disabled={isPending} />
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
                  <FormLabel>Description / Core Benefits</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Relieve stress with organic essential oils and scalp massage. Session is 45 mins." 
                      className="min-h-[80px]"
                      {...field} 
                      disabled={isPending} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="engaging">Engaging & Fun</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="witty">Witty & Clever</SelectItem>
                        <SelectItem value="informative">Informative</SelectItem>
                        <SelectItem value="hype">Excited / Hype</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Length" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isPending}>
              {isPending ? (
                <>Writing marketing copy...</>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Copy
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Output Panel */}
      <div className="h-full min-h-[400px]">
        <AIResultPanel
          title="Generated Marketing Copy"
          onCopy={handleCopy}
          onRegenerate={form.handleSubmit(onSubmit)}
          onClear={handleClear}
          isLoading={isPending}
          loadingText="Drafting marketing copy templates..."
          error={error}
          isEmpty={!result}
          emptyTitle="Copywriter Ready"
          emptyDescription="Configure your product parameters and target audience to generate optimized copy with hashtags and CTAs."
        >
          {result && (
            <div className="space-y-5 text-sm leading-relaxed">
              <div className="bg-card/30 border border-border/20 rounded-lg p-4 font-mono whitespace-pre-wrap select-text text-foreground">
                {result.mainCopy}
              </div>

              {result.cta && (
                <div className="flex items-start gap-2 bg-primary/5 border border-primary/10 rounded-lg p-3">
                  <Send className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-primary text-xs uppercase tracking-wide">Call To Action</h5>
                    <p className="text-foreground mt-0.5 select-all">{result.cta}</p>
                  </div>
                </div>
              )}

              {result.hashtags && result.hashtags.length > 0 && (
                <div className="flex items-start gap-2 bg-muted/20 border border-border/20 rounded-lg p-3">
                  <Tag className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">Suggested Tags</h5>
                    <div className="flex gap-1.5 flex-wrap mt-1.5">
                      {result.hashtags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] select-all">
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {result.shortVariation && (
                <div className="bg-muted/10 border border-border/10 rounded-lg p-3">
                  <h5 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">Short Variation (SMS/Stories)</h5>
                  <p className="text-muted-foreground mt-1 select-all italic">"{result.shortVariation}"</p>
                </div>
              )}
            </div>
          )}
        </AIResultPanel>
      </div>
    </div>
  );
}
