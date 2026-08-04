import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '../types';
import { cn } from '@/lib/utils';

export function InvoiceStatusBadge({ status, className }: { status: InvoiceStatus; className?: string }) {
  const statusConfig: Record<InvoiceStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline', colorClass?: string }> = {
    DRAFT: { label: 'Draft', variant: 'secondary' },
    SENT: { label: 'Sent', variant: 'outline', colorClass: 'text-blue-600 border-blue-200 bg-blue-50/50 dark:text-blue-400 dark:border-blue-800/30 dark:bg-blue-950/30' },
    PARTIALLY_PAID: { label: 'Partial', variant: 'outline', colorClass: 'text-amber-600 border-amber-200 bg-amber-50/50 dark:text-amber-400 dark:border-amber-800/30 dark:bg-amber-950/30' },
    PAID: { label: 'Paid', variant: 'outline', colorClass: 'text-emerald-600 border-emerald-200 bg-emerald-50/50 dark:text-emerald-400 dark:border-emerald-800/30 dark:bg-emerald-950/30' },
    OVERDUE: { label: 'Overdue', variant: 'destructive' },
    CANCELLED: { label: 'Cancelled', variant: 'outline', colorClass: 'text-muted-foreground border-border bg-muted/30 dark:text-muted-foreground dark:border-muted dark:bg-muted/20' },
    REFUNDED: { label: 'Refunded', variant: 'outline', colorClass: 'text-purple-600 border-purple-200 bg-purple-50/50 dark:text-purple-400 dark:border-purple-800/30 dark:bg-purple-950/30' },
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
