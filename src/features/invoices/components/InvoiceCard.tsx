'use client';


import { InvoiceRow } from '../types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
  invoice: InvoiceRow & { customer: { full_name: string; email: string | null } };
  isSelected: boolean;
  onToggleSelect: (id: string, selected: boolean) => void;
  onClick: (id: string) => void;
}

export function InvoiceCard({ invoice, isSelected, onToggleSelect, onClick }: Props) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <div 
      className="flex flex-col bg-card rounded-xl border p-4 shadow-sm space-y-3 cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => onClick(invoice.id)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div onClick={(e) => e.stopPropagation()} className="pt-1">
            <Checkbox 
              checked={isSelected} 
              onCheckedChange={(checked) => onToggleSelect(invoice.id, checked as boolean)} 
              className="h-5 w-5 rounded-md"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-base leading-tight truncate">
              {invoice.customer.full_name}
            </span>
            <span className="text-sm font-medium text-muted-foreground mt-0.5">
              {invoice.invoice_number}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-bold text-foreground text-base">
            {formatCurrency(invoice.total_amount, invoice.currency)}
          </span>
          <InvoiceStatusBadge status={invoice.status} className="mt-1" />
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium uppercase">Issued</span>
          <span className="text-sm text-foreground">
            {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(invoice.issue_date))}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground font-medium uppercase">Due</span>
          <span className="text-sm font-medium text-foreground">
            {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(invoice.due_date))}
          </span>
        </div>
      </div>
    </div>
  );
}
