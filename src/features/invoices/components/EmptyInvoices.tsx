import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
  workspaceSlug: string;
  isSearch?: boolean;
}

export function EmptyInvoices({ workspaceSlug, isSearch }: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-xl border border-dashed shadow-sm min-h-[400px]">
      <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
        <FileText className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
        {isSearch ? 'No invoices found' : 'No invoices yet'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {isSearch 
          ? "We couldn't find any invoices matching your filters. Try adjusting your search." 
          : "Create your first professional invoice and start getting paid faster."}
      </p>
      
      {!isSearch && (
        <Button asChild>
          <Link href={`/${workspaceSlug}/invoices/new`}>
            Create Invoice
          </Link>
        </Button>
      )}
    </div>
  );
}
