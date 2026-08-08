import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ServiceCatalogInputSchema, ServiceCatalogInput, ServiceCatalogOutput, GeneratedServiceSchema } from '../types';
import { generateServiceCatalogAction } from '../actions/ai.actions';
import { createServiceAction } from '@/features/services/actions/services.actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AIResultPanel } from './AIResultPanel';
import { Library, Sparkles, Plus, Clock, DollarSign } from 'lucide-react';
import { z } from 'zod';

type GeneratedService = z.infer<typeof GeneratedServiceSchema>;

interface Props {
  workspaceId: string;
}

export function ServiceCatalogGenerator({ workspaceId }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isAddingMap, setIsAddingMap] = useState<Record<number, boolean>>({});
  const [result, setResult] = useState<ServiceCatalogOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ServiceCatalogInput>({
    resolver: zodResolver(ServiceCatalogInputSchema),
    defaultValues: {
      serviceKeyword: '',
      targetClientele: '',
      pricingLevel: 'Standard',
      additionalPreferences: '',
    },
  });

  const onSubmit = (values: ServiceCatalogInput) => {
    setError(null);
    startTransition(async () => {
      const res = await generateServiceCatalogAction(workspaceId, values);
      if (res.error) {
        setError(res.error.message);
        toast({
          title: 'Catalog Generation Failed',
          description: res.error.message,
          variant: 'destructive',
        });
      } else {
        setResult(res.data);
        setIsAddingMap({});
        toast({
          title: 'Services Generated!',
          description: 'Review the suggested service packages below.',
        });
      }
    });
  };

  const handleAddService = async (service: GeneratedService, index: number) => {
    setIsAddingMap((prev) => ({ ...prev, [index]: true }));

    const res = await createServiceAction({
      workspaceId,
      name: service.name,
      category: service.category,
      description: service.description,
      durationMin: service.durationMinutes,
      price: service.suggestedPrice,
      colorCode: '#8B5CF6',
      isActive: true,
    });

    setIsAddingMap((prev) => ({ ...prev, [index]: false }));

    if (res.error) {
      toast({
        title: 'Failed to Add Service',
        description: res.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Service Added!',
        description: `"${service.name}" has been successfully added to your Services Catalog.`,
      });
    }
  };

  const handleClear = () => {
    setResult(null);
    setError(null);
    setIsAddingMap({});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      {/* Input Form */}
      <div className="bg-card/45 backdrop-blur-md border border-border/40 p-5 rounded-xl flex flex-col justify-between shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/40">
              <Library className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Catalog Planner</h3>
            </div>

            <FormField
              control={form.control}
              name="serviceKeyword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Keyword / Core Offering</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Massage, Balayage, Car detailing" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetClientele"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Clientele</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., busy corporate workers, families, luxury seekers" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pricingLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pricing Strategy Tier</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Budget">Budget / Value</SelectItem>
                      <SelectItem value="Standard">Standard / Mid-Tier</SelectItem>
                      <SelectItem value="Premium">Premium / Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Preferences (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Include organic items, mention that express options should be 30 mins." 
                      className="min-h-[80px]"
                      {...field} 
                      disabled={isPending} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-4" disabled={isPending}>
              {isPending ? (
                <>Analyzing catalog...</>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Service Ideas
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Output Panel */}
      <div className="h-full min-h-[400px]">
        <AIResultPanel
          title="Generated Services Ideas"
          onClear={handleClear}
          isLoading={isPending}
          loadingText="Designing new service packages..."
          error={error}
          isEmpty={!result || !result.suggestedServices}
          emptyTitle="Catalog Generator Ready"
          emptyDescription="Enter key concepts and target demographics to suggest new structured services with suggested timing, rates, and detailed copy."
        >
          {result && result.suggestedServices && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Review suggested packages. Click Add to directly import them into your active service list:
              </p>
              {result.suggestedServices.map((service, index) => {
                const isAdding = !!isAddingMap[index];
                return (
                  <div key={index} className="p-4 rounded-xl bg-card border border-border/40 space-y-3 relative shadow-sm flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className="font-bold text-foreground text-sm">{service.name}</h4>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {service.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal">{service.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {service.durationMinutes} mins
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                          ${service.suggestedPrice}
                        </span>
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      onClick={() => handleAddService(service, index)} 
                      disabled={isAdding}
                      className="w-full mt-2 min-h-[40px]"
                    >
                      {isAdding ? (
                        <>Adding Service...</>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add to Catalog
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </AIResultPanel>
      </div>
    </div>
  );
}
