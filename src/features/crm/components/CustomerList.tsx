'use client';

import { useState } from 'react';
import { Customer } from '../types';
import { CustomerCard } from './CustomerCard';
import { CreateCustomerSheet } from './CreateCustomerSheet';
import { CustomerDetailDrawer } from './CustomerDetailDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[44px] transition-colors ${
              selectedTag === null ? 'bg-purple-600 text-white' : 'bg-slate-950/60 text-slate-400 hover:text-white'
            }`}
          >
            All Customers ({initialCustomers.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[44px] transition-colors ${
                selectedTag === tag ? 'bg-purple-600 text-white' : 'bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => alert('CSV Import Architecture Ready: Upload your customer .csv file in settings.')}
            className="min-h-[44px] text-xs font-medium border-white/10"
          >
            📥 Import CSV
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="min-h-[44px] font-semibold flex-1 sm:flex-none">
            + New Customer
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <Input
        placeholder="Search by customer name, phone, or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-slate-900/60 border-white/10"
      />

      {/* Customer Grid */}
      {filtered.length === 0 ? (
        <div className="text-center p-12 rounded-2xl border border-white/10 bg-slate-900/40 space-y-3">
          <span className="text-4xl">👥</span>
          <h3 className="text-lg font-semibold text-white">No customers found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            No customers match your search criteria. Add your first customer profile to start tracking visits & notes.
          </p>
          <Button onClick={() => setIsCreateOpen(true)} size="sm" className="min-h-[44px]">
            + Add Customer
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CustomerCard key={c.id} customer={c} onSelect={(cust) => setActiveCustomer(cust)} />
          ))}
        </div>
      )}

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
