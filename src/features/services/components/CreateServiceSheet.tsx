'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createServiceAction } from '../actions/services.actions';
import { SERVICE_CATEGORIES } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateServiceSheet({ workspaceId, isOpen, onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(SERVICE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('50');
  const [durationMin, setDurationMin] = useState('30');
  const [colorCode, setColorCode] = useState('#8B5CF6');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await createServiceAction({
      workspaceId,
      name,
      category,
      description,
      price: Number(price),
      durationMin: Number(durationMin),
      colorCode,
      isActive: true,
      isFeatured: false,
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Create New Service</h2>
            <p className="text-xs text-slate-400">Add a service to your business catalog & booking menu</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-sm min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="sName">Service Name</Label>
            <Input
              id="sName"
              placeholder="e.g. Executive Haircut & Beard Trim"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sCategory">Industry Category</Label>
              <select
                id="sCategory"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-base md:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
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
              <Label htmlFor="sPrice">Price ($ USD)</Label>
              <Input
                id="sPrice"
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
              <Label htmlFor="sDuration">Duration (Minutes)</Label>
              <Input
                id="sDuration"
                type="number"
                placeholder="30"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sColor">Badge Color Theme</Label>
              <Input
                id="sColor"
                type="color"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="h-11 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sDesc">Service Description</Label>
            <Input
              id="sDesc"
              placeholder="e.g. Includes warm towel, wash, cut, and styling."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-h-[44px]">
              {loading ? 'Adding...' : 'Add Service'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
