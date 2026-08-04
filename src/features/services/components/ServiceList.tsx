'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Service } from '../types';
import { CreateServiceSheet } from './CreateServiceSheet';
import { EditServiceSheet } from './EditServiceSheet';
import { deleteServiceAction } from '../actions/services.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
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
import { Briefcase, Search } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

interface Props {
  workspaceId: string;
  initialServices: Service[];
}

export function ServiceList({ workspaceId, initialServices }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const categories = Array.from(new Set(initialServices.map((s) => s.category)));

  const filtered = initialServices.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory && s.category !== selectedCategory) return false;

    return true;
  });

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    setIsDeleting(serviceId);
    const res = await deleteServiceAction(workspaceId, serviceId);
    setIsDeleting(null);

    if (res.error) {
      toast({
        title: 'Delete failed',
        description: res.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Service deleted',
        description: 'The service has been removed successfully.',
      });
      router.refresh();
    }
  };

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
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Grid Display */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Briefcase}
                title="No services created"
                description="Create services so appointments and invoices can be generated."
                action={
                  <Button onClick={() => setIsSheetOpen(true)} className="w-full sm:w-auto min-h-[44px]">
                    + Create Service
                  </Button>
                }
              />
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
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditingService(service)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(service.id)}
                          disabled={isDeleting === service.id}
                        >
                          {isDeleting === service.id ? 'Deleting…' : 'Delete'}
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
      
      {/* Edit Service Modal */}
      <EditServiceSheet
        workspaceId={workspaceId}
        service={editingService}
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
      />
    </div>
  );
}
