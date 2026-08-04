'use client';

import { useFieldArray, Control, UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { CreateInvoiceInput } from '../validations/invoice.schema';
import { Service } from '@/features/services/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ServiceSelector } from './ServiceSelector';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { InvoiceCalculations } from '../utils/invoice-calculator';

interface Props {
  control: Control<CreateInvoiceInput>;
  register: UseFormRegister<CreateInvoiceInput>;
  watch: UseFormWatch<CreateInvoiceInput>;
  setValue: UseFormSetValue<CreateInvoiceInput>;
  services: Service[];
  calculations: InvoiceCalculations;
  errors: any;
}

export function InvoiceLineItems({
  control,
  register,
  watch,
  setValue,
  services,
  calculations,
  errors
}: Props) {
  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: 'items',
  });

  const currency = watch('currency') || 'USD';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const itemError = errors?.items?.[index];
        const lineTotal = calculations.items[index]?.total || 0;

        return (
          <Card key={field.id} className="relative overflow-visible shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              {/* Row 1: Description & Service Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-4 space-y-1.5">
                  <Label>Service (Optional)</Label>
                  <ServiceSelector
                    services={services}
                    value={watch(`items.${index}.service_id`)}
                    onSelectService={(service) => {
                      if (service) {
                        setValue(`items.${index}.service_id`, service.id);
                        setValue(`items.${index}.description`, service.name);
                        setValue(`items.${index}.unit_price`, Number(service.price));
                        // Assuming 0 discount and tax to start, unless service has tax defined in a future phase
                        setValue(`items.${index}.tax_rate`, 0); 
                      } else {
                        setValue(`items.${index}.service_id`, null);
                      }
                    }}
                  />
                </div>
                <div className="sm:col-span-8 space-y-1.5">
                  <Label>Description</Label>
                  <Input 
                    {...register(`items.${index}.description`)} 
                    placeholder="Enter item description"
                    className={itemError?.description ? "border-destructive" : ""}
                  />
                  {itemError?.description && <p className="text-xs text-destructive">{itemError.description.message}</p>}
                </div>
              </div>

              {/* Row 2: Quantities, Prices, and Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Qty</Label>
                  <Input 
                    type="number" 
                    step="1"
                    min="1"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })} 
                    className={itemError?.quantity ? "border-destructive" : ""}
                  />
                  {itemError?.quantity && <p className="text-xs text-destructive">{itemError.quantity.message}</p>}
                </div>
                <div className="sm:col-span-3 space-y-1.5">
                  <Label>Unit Price</Label>
                  <Input 
                    type="number"
                    step="0.01" 
                    min="0"
                    {...register(`items.${index}.unit_price`, { valueAsNumber: true })} 
                    className={itemError?.unit_price ? "border-destructive" : ""}
                  />
                  {itemError?.unit_price && <p className="text-xs text-destructive">{itemError.unit_price.message}</p>}
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Discount</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0"
                    {...register(`items.${index}.discount`, { valueAsNumber: true })} 
                    className={itemError?.discount ? "border-destructive" : ""}
                  />
                  {itemError?.discount && <p className="text-xs text-destructive">{itemError.discount.message}</p>}
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Tax %</Label>
                  <Input 
                    type="number"
                    step="0.1" 
                    min="0"
                    max="100"
                    {...register(`items.${index}.tax_rate`, { valueAsNumber: true })} 
                    className={itemError?.tax_rate ? "border-destructive" : ""}
                  />
                  {itemError?.tax_rate && <p className="text-xs text-destructive">{itemError.tax_rate.message}</p>}
                </div>
                
                {/* Line Total & Actions */}
                <div className="col-span-2 sm:col-span-3 flex justify-between items-center sm:pl-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Total</span>
                    <span className="text-base font-bold text-foreground truncate">{formatCurrency(lineTotal)}</span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Duplicate Line"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const currentItem = watch(`items.${index}`);
                        insert(index + 1, currentItem);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Remove Line"
                      disabled={fields.length === 1}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {errors?.items?.message && (
        <p className="text-sm font-medium text-destructive">{errors.items.message}</p>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed"
        onClick={() => append({
          description: '',
          quantity: 1,
          unit_price: 0,
          discount: 0,
          tax_rate: 0,
          service_id: null,
        })}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Item
      </Button>
    </div>
  );
}
