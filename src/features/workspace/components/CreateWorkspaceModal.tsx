'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createWorkspaceAction } from '../actions/workspace.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const INDUSTRIES = [
  'Barber Shop / Salon',
  'Medical / Dental Clinic',
  'Coaching / Academy / School',
  'Gym / Yoga Studio',
  'Repair Shop',
  'Agency / Consulting',
  'Office / Co-working',
  'Local Services',
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [industryType, setIndustryType] = useState(INDUSTRIES[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await createWorkspaceAction({
      name,
      slug,
      industryType,
    });

    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    onClose();
    router.push(`/${res.data.slug}`);
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Create New Workspace</h2>
            <p className="text-xs text-slate-400">Set up your business workspace in seconds</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-sm min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-slate-800"
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

          <div className="space-y-2">
            <Label htmlFor="wsName">Business / Workspace Name</Label>
            <Input
              id="wsName"
              placeholder="e.g. Apex Barber Studio"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wsSlug">Workspace Slug (URL Prefix)</Label>
            <div className="flex items-center rounded-lg border border-white/10 bg-slate-950/50 px-3 text-slate-400 text-sm">
              <span>flowos.app/</span>
              <input
                id="wsSlug"
                type="text"
                className="bg-transparent py-2 pl-1 text-white focus:outline-none w-full"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry Vertical</Label>
            <select
              id="industry"
              className="w-full rounded-lg border border-white/10 bg-slate-950 p-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={industryType}
              onChange={(e) => setIndustryType(e.target.value)}
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Provisioning...' : 'Provision Workspace'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
