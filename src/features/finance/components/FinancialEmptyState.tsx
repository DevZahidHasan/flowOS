import { Button } from '@/components/ui/button';
import { Plus, Wallet } from 'lucide-react';

interface Props {
  onAddExpense: () => void;
}

export function FinancialEmptyState({ onAddExpense }: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card/25 backdrop-blur-md border border-border/40 rounded-2xl min-h-[300px] shadow-lg animate-in fade-in duration-200">
      <div className="p-4 bg-primary/10 rounded-full mb-4 text-primary">
        <Wallet className="h-10 w-10" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">No expenses recorded yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        Start tracking your business expenses to understand where your money is going and compute accurate profit margins.
      </p>
      <Button onClick={onAddExpense} className="min-h-[44px]">
        <Plus className="h-4 w-4 mr-2" />
        Add Expense
      </Button>
    </div>
  );
}
