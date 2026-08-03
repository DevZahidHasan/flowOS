'use client';

import { useState } from 'react';
import { Service } from '../types';
import { ServiceCard } from './ServiceCard';
import { CreateServiceSheet } from './CreateServiceSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  workspaceId: string;
  initialServices: Service[];
}

export function ServiceList({ workspaceId, initialServices }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const categories = Array.from(new Set(initialServices.map((s) => s.category)));

  const filtered = initialServices.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory && s.category !== selectedCategory) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Category Tabs & Create Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[44px] transition-colors ${
              selectedCategory === null ? 'bg-purple-600 text-white' : 'bg-slate-950/60 text-slate-400 hover:text-white'
            }`}
          >
            All Services ({initialServices.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[44px] transition-colors ${
                selectedCategory === cat ? 'bg-purple-600 text-white' : 'bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Button onClick={() => setIsSheetOpen(true)} className="min-h-[44px] font-semibold flex-1 sm:flex-none">
          + Add Service
        </Button>
      </div>

      {/* Search Bar */}
      <Input
        placeholder="Search services by title or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-slate-900/60 border-white/10"
      />

      {/* Grid Display */}
      {filtered.length === 0 ? (
        <div className="text-center p-12 rounded-2xl border border-white/10 bg-slate-900/40 space-y-3">
          <span className="text-4xl">💼</span>
          <h3 className="text-lg font-semibold text-white">No services found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            No services match your search. Add your first service to start offering appointments.
          </p>
          <Button onClick={() => setIsSheetOpen(true)} size="sm" className="min-h-[44px]">
            + Add Service
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} workspaceId={workspaceId} />
          ))}
        </div>
      )}

      {/* Create Bottom Sheet Modal */}
      <CreateServiceSheet
        workspaceId={workspaceId}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
