'use client';

import { useState } from 'react';
import { Service } from '../types';
import { CreateServiceSheet } from './CreateServiceSheet';
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={selectedCategory === null ? "default" : "secondary"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="whitespace-nowrap"
          >
            All Services ({initialServices.length})
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>

        <Button onClick={() => setIsSheetOpen(true)}>
          + Add Service
        </Button>
      </div>

      {/* Search Bar */}
      <Input
        placeholder="Search services by title or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {/* Grid Display */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center p-12 space-y-3">
              <span className="text-4xl text-muted-foreground">💼</span>
              <h3 className="text-lg font-semibold text-foreground">No services found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                No services match your search. Add your first service to start offering appointments.
              </p>
              <Button onClick={() => setIsSheetOpen(true)} size="sm">
                + Add Service
              </Button>
            </div>
          ) : (
            <div className="rounded-md border-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((service) => (
                    <TableRow key={service.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div>{service.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                          {service.description || 'No description'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {service.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm">
                          <span>⏱</span>
                          <span>{service.durationMin} min</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">${service.price.toFixed(2)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
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

      {/* Create Bottom Sheet Modal */}
      <CreateServiceSheet
        workspaceId={workspaceId}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
