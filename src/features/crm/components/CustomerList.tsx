'use client';

import { useState } from 'react';
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

interface Props {
  workspaceId: string;
  initialCustomers: Customer[];
}

export function CustomerList({ workspaceId, initialCustomers }: Props) {
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
            onClick={() => alert('CSV Import Architecture Ready: Upload your customer .csv file in settings.')}
          >
            📥 Import CSV
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            + New Customer
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <Input
        placeholder="Search by customer name, phone, or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {/* Customer Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center p-12 space-y-3">
              <span className="text-4xl text-muted-foreground">👥</span>
              <h3 className="text-lg font-semibold text-foreground">No customers found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                No customers match your search criteria. Add your first customer profile to start tracking visits & notes.
              </p>
              <Button onClick={() => setIsCreateOpen(true)} size="sm">
                + Add Customer
              </Button>
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
