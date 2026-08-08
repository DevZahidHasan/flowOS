import { useState, useTransition } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { deleteExpenseAction } from '../actions/finance.actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Edit2, Trash2, MoreVertical, Calendar, CreditCard, RotateCcw } from 'lucide-react';

interface Props {
  workspaceId: string;
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
}

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Rent: '🏠',
  Utilities: '⚡',
  Salaries: '👥',
  Marketing: '📣',
  Supplies: '📦',
  Equipment: '⚙️',
  Software: '💻',
  Transportation: '🚗',
  Taxes: '📄',
  Maintenance: '🔧',
  Other: '💸',
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Rent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Utilities: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Salaries: 'bg-green-500/10 text-green-400 border-green-500/20',
  Marketing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Supplies: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Equipment: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Software: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Transportation: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Taxes: 'bg-red-500/10 text-red-400 border-red-500/20',
  Maintenance: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export function ExpenseList({ workspaceId, expenses, onEdit }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (!deletingId) return;

    startTransition(async () => {
      const res = await deleteExpenseAction(workspaceId, deletingId);
      setDeletingId(null);

      if (res.error) {
        toast({
          title: 'Failed to Delete Expense',
          description: res.error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Expense Deleted',
          description: 'The expense record was successfully archived.',
        });
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const icon = CATEGORY_ICONS[expense.category] || '💸';
        const colorClass = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other;

        return (
          <div
            key={expense.id}
            className="flex items-center justify-between p-4 bg-card/25 backdrop-blur-md border border-border/40 hover:border-border/80 transition-all duration-200 rounded-2xl shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex items-center justify-center h-10 w-10 text-lg rounded-xl border ${colorClass}`}>
                {icon}
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-sm text-foreground truncate">{expense.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {expense.expenseDate}
                  </span>
                  <span className="h-1 w-1 bg-border rounded-full" />
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    {expense.paymentMethod}
                  </span>
                  {expense.isRecurring && (
                    <>
                      <span className="h-1 w-1 bg-border rounded-full" />
                      <span className="flex items-center gap-1 text-primary">
                        <RotateCcw className="h-3 w-3" />
                        {expense.recurrencePeriod}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-4 shrink-0">
              <span className="text-sm font-bold text-foreground">
                -${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/40 rounded-xl" disabled={isPending}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-md border-border/40">
                  <DropdownMenuItem onClick={() => onEdit(expense)} className="gap-2 cursor-pointer text-sm">
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeletingId(expense.id)}
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 text-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}

      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense Record"
        description="Are you sure you want to delete this expense record? This action will archive the transaction."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isPending}
        variant="destructive"
      />
    </div>
  );
}
