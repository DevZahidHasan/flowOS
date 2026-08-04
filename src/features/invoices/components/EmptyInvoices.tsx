'use client';

import { Receipt, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/shared/EmptyState';

interface Props {
  workspaceSlug: string;
  isSearch?: boolean;
}

export function EmptyInvoices({ workspaceSlug, isSearch }: Props) {
  const router = useRouter();

  const handleClearFilters = () => {
    router.push(`/${workspaceSlug}/invoices`);
  };

  if (isSearch) {
    return (
      <EmptyState
        icon={Search}
        title="No matching invoices"
        description="Try changing your filters or search query."
        action={
          <Button onClick={handleClearFilters} className="w-full sm:w-auto min-h-[44px]">
            Clear Filters
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      icon={Receipt}
      title="No invoices yet"
      description="Create your first invoice and start tracking customer payments."
      action={
        <Button asChild className="w-full sm:w-auto min-h-[44px]">
          <Link href={`/${workspaceSlug}/invoices/new`}>
            Create Invoice
          </Link>
        </Button>
      }
    />
  );
}
