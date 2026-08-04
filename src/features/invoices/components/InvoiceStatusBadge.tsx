import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '../types';
import { cn } from '@/lib/utils';

export function InvoiceStatusBadge({ status, className }: { status: InvoiceStatus; className?: string }) {
  const statusConfig: Record<InvoiceStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline', colorClass?: string }> = {
    DRAFT: { label: 'Draft', variant: 'secondary' },
    SENT: { label: 'Sent', variant: 'outline', colorClass: 'text-blue-500 border-blue-200 bg-blue-50' },
    PARTIALLY_PAID: { label: 'Partial', variant: 'outline', colorClass: 'text-amber-600 border-amber-200 bg-amber-50' },
    PAID: { label: 'Paid', variant: 'outline', colorClass: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
    OVERDUE: { label: 'Overdue', variant: 'destructive' },
    CANCELLED: { label: 'Cancelled', variant: 'outline', colorClass: 'text-muted-foreground border-border bg-muted' },
    REFUNDED: { label: 'Refunded', variant: 'outline', colorClass: 'text-purple-600 border-purple-200 bg-purple-50' },
  };

  const config = statusConfig[status];

  return (
    <Badge 
      variant={config.variant} 
      className={cn("whitespace-nowrap px-2 py-0.5 text-xs font-semibold rounded-md", config.colorClass, className)}
    >
      {config.label}
    </Badge>
  );
}
