'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceRow } from '@/features/invoices/types';
import { InvoiceTable } from '@/features/invoices/components/InvoiceTable';
import { InvoiceCard } from '@/features/invoices/components/InvoiceCard';
import { InvoiceBulkActions } from '@/features/invoices/components/InvoiceBulkActions';

interface Props {
  workspaceId: string;
  invoices: Array<InvoiceRow & { customer: { full_name: string; email: string | null } }>;
}

export function InvoiceListClient({ workspaceId, invoices }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const router = useRouter();

  const handleToggleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => 
      selected ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleToggleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? invoices.map((i) => i.id) : []);
  };

  const handleRowClick = (id: string) => {
    // For now, doing nothing since we don't have Invoice Details Phase built yet.
    // In Phase 5, this would route to /invoices/[id]
    console.log("Clicked invoice", id);
  };

  const clearSelection = () => setSelectedIds([]);

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="sticky top-0 z-10 py-2 bg-background/95 backdrop-blur">
          <InvoiceBulkActions 
            workspaceId={workspaceId} 
            selectedIds={selectedIds} 
            onClearSelection={clearSelection} 
          />
        </div>
      )}

      <div className="hidden md:block">
        <InvoiceTable 
          invoices={invoices}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onClick={handleRowClick}
        />
      </div>

      <div className="md:hidden space-y-4">
        {invoices.map((invoice) => (
          <InvoiceCard 
            key={invoice.id}
            invoice={invoice}
            isSelected={selectedIds.includes(invoice.id)}
            onToggleSelect={handleToggleSelect}
            onClick={handleRowClick}
          />
        ))}
      </div>
    </div>
  );
}
