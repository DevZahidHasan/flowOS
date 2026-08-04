'use client';

import { useState } from 'react';
import { Customer } from '@/features/crm/types';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  customers: Customer[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function CustomerSelector({ customers, value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCustomer = customers.find((c) => c.id === value);

  const filteredCustomers = customers.filter((c) =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col space-y-1.5">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal bg-background h-12 shadow-sm border-input",
              !value && "text-muted-foreground",
              error && "border-destructive focus-visible:ring-destructive"
            )}
          >
            {selectedCustomer ? (
              <div className="flex items-center space-x-3 truncate">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                  {selectedCustomer.fullName.substring(0, 2).toUpperCase()}
                </div>
                <span className="truncate">{selectedCustomer.fullName}</span>
              </div>
            ) : (
              "Select a customer..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[300px] sm:w-[400px] max-h-[300px] overflow-y-auto p-0">
          <div className="flex items-center border-b px-3 sticky top-0 bg-background z-10">
            <input
              placeholder="Search customers..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="py-2 px-1">
            {filteredCustomers.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No customer found.
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <DropdownMenuItem
                  key={customer.id}
                  onSelect={() => {
                    onChange(customer.id);
                    setOpen(false);
                  }}
                  className="flex items-center space-x-3 p-3 cursor-pointer"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {customer.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium leading-none truncate">{customer.fullName}</p>
                    {customer.email && (
                      <p className="text-xs text-muted-foreground truncate mt-1">{customer.email}</p>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === customer.id ? "opacity-100 text-primary" : "opacity-0"
                    )}
                  />
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
