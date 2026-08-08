import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Expense, CreateExpenseInput, createExpenseSchema } from '../types';
import { createExpenseAction, updateExpenseAction } from '../actions/finance.actions';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Props {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense | null;
}

export function ExpenseFormSheet({ workspaceId, isOpen, onClose, expense }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = !!expense;

  const form = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: 0,
      category: 'Other',
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      isRecurring: false,
      recurrencePeriod: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (expense) {
        form.reset({
          title: expense.title,
          description: expense.description || '',
          amount: expense.amount,
          category: expense.category,
          expenseDate: expense.expenseDate,
          paymentMethod: expense.paymentMethod,
          isRecurring: expense.isRecurring,
          recurrencePeriod: (expense.recurrencePeriod as 'Weekly' | 'Monthly' | 'Yearly' | null) || null,
        });
      } else {
        form.reset({
          title: '',
          description: '',
          amount: 0,
          category: 'Other',
          expenseDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'Cash',
          isRecurring: false,
          recurrencePeriod: null,
        });
      }
    }
  }, [isOpen, expense, form]);

  const onSubmit = (values: CreateExpenseInput) => {
    startTransition(async () => {
      let res;
      if (isEdit && expense) {
        res = await updateExpenseAction(workspaceId, expense.id, values);
      } else {
        res = await createExpenseAction(workspaceId, values);
      }

      if (res.error) {
        toast({
          title: isEdit ? 'Failed to Update Expense' : 'Failed to Create Expense',
          description: res.error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: isEdit ? 'Expense Updated' : 'Expense Created',
          description: `"${values.title}" has been successfully saved.`,
        });
        onClose();
        router.refresh();
      }
    });
  };

  const isRecurring = form.watch('isRecurring');

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto flex flex-col justify-between">
        <div>
          <SheetHeader className="mb-6">
            <SheetTitle>{isEdit ? 'Edit Expense Record' : 'Record New Expense'}</SheetTitle>
            <SheetDescription>
              {isEdit ? 'Update your business expense transaction details.' : 'Log operational costs, supplier payments, or utilities.'}
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title / Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Monthly Rent Payment" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (USD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                          disabled={isPending} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expenseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Rent">Rent</SelectItem>
                          <SelectItem value="Utilities">Utilities</SelectItem>
                          <SelectItem value="Salaries">Salaries</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Supplies">Supplies</SelectItem>
                          <SelectItem value="Equipment">Equipment</SelectItem>
                          <SelectItem value="Software">Software</SelectItem>
                          <SelectItem value="Transportation">Transportation</SelectItem>
                          <SelectItem value="Taxes">Taxes</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Card">Card</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Check">Check</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description / Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add transaction detail, receipt number, or item breakdown..." 
                        {...field} 
                        value={field.value || ''} 
                        disabled={isPending} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-3 bg-muted/30 border border-border/40 rounded-xl space-y-3">
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div>
                        <FormLabel className="text-xs font-semibold">Recurring Expense</FormLabel>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Toggle if this is a recurring subscription or payment.</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {isRecurring && (
                  <FormField
                    control={form.control}
                    name="recurrencePeriod"
                    render={({ field }) => (
                      <FormItem className="animate-in slide-in-from-top duration-200">
                        <FormLabel className="text-[11px]">Recurrence Cycle</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined} disabled={isPending}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Period" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Weekly">Every Week</SelectItem>
                            <SelectItem value="Monthly">Every Month</SelectItem>
                            <SelectItem value="Yearly">Every Year</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </form>
          </Form>
        </div>

        <SheetFooter className="mt-8 pt-4 border-t border-border/40">
          <Button variant="outline" onClick={onClose} disabled={isPending} className="w-full sm:w-auto min-h-[44px]">
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending} className="w-full sm:w-auto min-h-[44px]">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Record Expense'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
