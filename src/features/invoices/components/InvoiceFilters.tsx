'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export function InvoiceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.delete('page'); // Reset pagination on filter change
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get('q') || '')) {
      router.push(pathname + '?' + createQueryString('q', debouncedSearch));
    }
  }, [debouncedSearch, pathname, router, createQueryString, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-10 w-full bg-background"
        />
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        <Select 
          value={searchParams.get('status') || 'ALL'} 
          onValueChange={(val) => {
            router.push(pathname + '?' + createQueryString('status', val === 'ALL' ? '' : val));
          }}
        >
          <SelectTrigger className="w-[140px] h-10 bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={searchParams.get('sort') || 'created_at:desc'} 
          onValueChange={(val) => {
            router.push(pathname + '?' + createQueryString('sort', val));
          }}
        >
          <SelectTrigger className="w-[160px] h-10 bg-background">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at:desc">Newest First</SelectItem>
            <SelectItem value="created_at:asc">Oldest First</SelectItem>
            <SelectItem value="total_amount:desc">Amount (High to Low)</SelectItem>
            <SelectItem value="total_amount:asc">Amount (Low to High)</SelectItem>
            <SelectItem value="due_date:asc">Due Date (Soonest)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
