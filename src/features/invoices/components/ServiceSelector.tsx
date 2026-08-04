'use client';

import { useState } from 'react';
import { Service } from '@/features/services/types';
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
  services: Service[];
  value?: string | null;
  onSelectService: (service: Service | null) => void;
  error?: string;
  className?: string;
}

export function ServiceSelector({ services, value, onSelectService, error, className }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedService = services.find((s) => s.id === value);

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.category && s.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className={cn("flex flex-col space-y-1.5", className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal bg-background h-10 shadow-sm border-input",
              !value && "text-muted-foreground",
              error && "border-destructive focus-visible:ring-destructive"
            )}
          >
            <span className="truncate">{selectedService ? selectedService.name : "Select a service (Optional)..."}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[300px] max-h-[300px] overflow-y-auto p-0 z-[100]">
          <div className="flex items-center border-b px-3 sticky top-0 bg-background z-10">
            <input
              placeholder="Search services..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="py-2 px-1">
            <DropdownMenuItem
              onSelect={() => {
                onSelectService(null);
                setOpen(false);
              }}
              className="flex items-center space-x-3 p-3 cursor-pointer text-muted-foreground italic"
            >
              Clear selection
            </DropdownMenuItem>

            {filteredServices.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No services found.
              </div>
            ) : (
              filteredServices.map((service) => (
                <DropdownMenuItem
                  key={service.id}
                  onSelect={() => {
                    onSelectService(service);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between p-3 cursor-pointer"
                >
                  <div className="flex-1 overflow-hidden pr-4">
                    <p className="text-sm font-medium leading-none truncate">{service.name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">{service.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">${Number(service.price).toFixed(2)}</p>
                  </div>
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
