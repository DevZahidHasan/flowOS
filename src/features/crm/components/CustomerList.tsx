'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '../types';
import { CreateCustomerSheet } from './CreateCustomerSheet';
import { CustomerDetailDrawer } from './CustomerDetailDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Search } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

interface Props {
  workspaceId: string;
  initialCustomers: Customer[];
}

export function CustomerList({ workspaceId, initialCustomers }: Props) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

  // Extract unique tags across all customers
  const allTags = Array.from(
    new Set(initialCustomers.flatMap((c) => c.tags || []))
  );

  const filtered = initialCustomers.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedTag && (!c.tags || !c.tags.includes(selectedTag))) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={selectedTag === null ? "default" : "secondary"}
            size="sm"
            onClick={() => setSelectedTag(null)}
            className="whitespace-nowrap"
          >
            All ({initialCustomers.length})
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedTag(tag)}
              className="whitespace-nowrap"
            >
              #{tag}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => toast({
              title: 'CSV Import Ready',
              description: 'Upload your customer .csv file in settings to import data.',
            })}
          >
            📥 Import CSV
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            + New Customer
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Customer Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="No customers yet"
                description="Start building your customer database by adding your first customer."
                action={
                  <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto min-h-[44px]">
                    + Add Customer
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="rounded-md border-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setActiveCustomer(c)}>
                      <TableCell className="font-medium">
                        <div>{c.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          Added {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{c.phone || '-'}</div>
                        <div className="text-xs text-muted-foreground">{c.email || ''}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold">{c.totalVisits} visits</div>
                        <div className="text-xs text-muted-foreground">${c.lifetimeSpending.toFixed(2)} LTV</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(c.tags || []).map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setActiveCustomer(c); }}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals & Drawers */}
      <CreateCustomerSheet
        workspaceId={workspaceId}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <CustomerDetailDrawer
        workspaceId={workspaceId}
        customer={activeCustomer}
        onClose={() => setActiveCustomer(null)}
      />
    </div>
  );
}
