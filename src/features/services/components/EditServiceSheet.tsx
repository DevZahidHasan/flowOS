'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateServiceAction } from '../actions/services.actions';
import { SERVICE_CATEGORIES, Service } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Props {
  workspaceId: string;
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditServiceSheet({ workspaceId, service, isOpen, onClose }: Props) {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(SERVICE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [colorCode, setColorCode] = useState('#8B5CF6');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service && isOpen) {
      setName(service.name);
      setCategory(service.category);
      setDescription(service.description || '');
      setPrice(service.price.toString());
      setDurationMin(service.durationMin.toString());
      setColorCode(service.colorCode);
      setErrorMsg(null);
    }
  }, [service, isOpen]);

  if (!isOpen || !service) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await updateServiceAction({
      workspaceId,
      serviceId: service.id,
      name,
      category,
      description,
      price: Number(price),
      durationMin: Number(durationMin),
      colorCode,
      isActive: service.isActive,
      isFeatured: service.isFeatured,
    });

    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    onClose();
    router.refresh();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit Service</SheetTitle>
          <SheetDescription>
            Update service details, pricing, and duration
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="eName">Service Name</Label>
            <Input
              id="eName"
              placeholder="e.g. Executive Haircut & Beard Trim"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="eCategory">Industry Category</Label>
              <select
                id="eCategory"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ePrice">Price ($ USD)</Label>
              <Input
                id="ePrice"
                type="number"
                step="0.01"
                placeholder="50.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="eDuration">Duration (Minutes)</Label>
              <Input
                id="eDuration"
                type="number"
                placeholder="30"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="eColor">Badge Color Theme</Label>
              <Input
                id="eColor"
                type="color"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="h-11 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="eDesc">Service Description</Label>
            <Input
              id="eDesc"
              placeholder="e.g. Includes warm towel, wash, cut, and styling."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
