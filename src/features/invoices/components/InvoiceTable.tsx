'use client';


import { InvoiceRow } from '../types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Props {
  invoices: Array<InvoiceRow & { customer: { full_name: string; email: string | null } }>;
  selectedIds: string[];
  onToggleSelect: (id: string, selected: boolean) => void;
  onToggleSelectAll: (selected: boolean) => void;
  onClick: (id: string) => void;
}

export function InvoiceTable({ invoices, selectedIds, onToggleSelect, onToggleSelectAll, onClick }: Props) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const allSelected = invoices.length > 0 && selectedIds.length === invoices.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < invoices.length;

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[40px] pl-4">
              <Checkbox 
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={(checked) => onToggleSelectAll(checked as boolean)}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="w-[130px] font-semibold text-foreground">Invoice</TableHead>
            <TableHead className="font-semibold text-foreground">Customer</TableHead>
            <TableHead className="w-[120px] font-semibold text-foreground">Issued</TableHead>
            <TableHead className="w-[120px] font-semibold text-foreground">Due Date</TableHead>
            <TableHead className="w-[140px] font-semibold text-foreground text-right">Amount</TableHead>
            <TableHead className="w-[120px] font-semibold text-foreground text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow 
              key={invoice.id} 
              onClick={() => onClick(invoice.id)}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                <Checkbox 
                  checked={selectedIds.includes(invoice.id)}
                  onCheckedChange={(checked) => onToggleSelect(invoice.id, checked as boolean)}
                  aria-label={`Select invoice ${invoice.invoice_number}`}
                />
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {invoice.invoice_number}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{invoice.customer.full_name}</span>
                  {invoice.customer.email && (
                    <span className="text-xs text-muted-foreground">{invoice.customer.email}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(invoice.issue_date))}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(invoice.due_date))}
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(invoice.total_amount, invoice.currency)}
              </TableCell>
              <TableCell className="text-center">
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
