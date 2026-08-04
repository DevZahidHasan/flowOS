'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateInvoiceInput, CreateInvoiceSchema } from '../validations/invoice.schema';
import { Customer } from '@/features/crm/types';
import { Service } from '@/features/services/types';
import { calculateInvoiceTotals } from '../utils/invoice-calculator';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { CustomerSelector } from './CustomerSelector';
import { InvoiceLineItems } from './InvoiceLineItems';
import { InvoiceSummary } from './InvoiceSummary';

interface Props {
  workspaceId: string;
  customers: Customer[];
  services: Service[];
  onSubmit: (data: CreateInvoiceInput) => Promise<void>;
  isLoading: boolean;
}

export function InvoiceForm({ workspaceId, customers, services, onSubmit, isLoading }: Props) {
  const form = useForm<CreateInvoiceInput>({
    resolver: zodResolver(CreateInvoiceSchema),
    defaultValues: {
      workspace_id: workspaceId,
      customer_id: '',
      currency: 'USD',
      items: [
        {
          description: '',
          quantity: 1,
          unit_price: 0,
          discount: 0,
          tax_rate: 0,
          service_id: null,
        }
      ],
      notes: '',
      // Default to today
      issue_date: new Date().toISOString(),
      // Default to +7 days
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
  });

  // Watch items to calculate live totals
  const items = useWatch({ control: form.control, name: 'items' });
  const currency = useWatch({ control: form.control, name: 'currency' }) || 'USD';
  
  // Safe calculation using the dedicated utility
  const calculations = calculateInvoiceTotals(items || []);

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Section: Customer & Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Bill To</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerSelector
                customers={customers}
                value={form.watch('customer_id')}
                onChange={(val) => form.setValue('customer_id', val, { shouldValidate: true })}
                error={form.formState.errors.customer_id?.message}
              />
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceLineItems
                control={form.control}
                register={form.register}
                watch={form.watch}
                setValue={form.setValue}
                services={services}
                calculations={calculations}
                errors={form.formState.errors}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                {...form.register('notes')} 
                placeholder="Thank you for your business!"
                className="min-h-[100px] resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Dates, Currency & Summary */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border/50 bg-muted/10">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input 
                  type="date" 
                  value={form.watch('issue_date')?.substring(0, 10)}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                    form.setValue('issue_date', date);
                  }}
                  className={form.formState.errors.issue_date ? "border-destructive" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input 
                  type="date" 
                  value={form.watch('due_date')?.substring(0, 10)}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                    form.setValue('due_date', date);
                  }}
                  className={form.formState.errors.due_date ? "border-destructive" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select 
                  value={currency} 
                  onValueChange={(val) => form.setValue('currency', val)}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="BDT">BDT (৳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="sticky top-6">
            <InvoiceSummary calculations={calculations} currency={currency} />
            
            <div className="mt-6 flex flex-col gap-3">
              <Button type="submit" size="lg" className="w-full font-semibold" disabled={isLoading}>
                {isLoading ? "Saving..." : "Create Invoice"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
