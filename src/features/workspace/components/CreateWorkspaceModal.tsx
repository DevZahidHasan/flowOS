'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

  const [mounted, setMounted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !mounted) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocus) {
        previousFocus.focus();
      }
    };
  }, [isOpen, mounted, onClose]);

  if (!isOpen || !mounted) return null;

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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border bg-card text-card-foreground p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-foreground">Create New Workspace</h2>
            <p className="text-xs text-muted-foreground">Set up your business workspace in seconds</p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close modal"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-muted"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div role="alert" className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
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
            <div className="flex items-center rounded-lg border bg-muted/20 px-3 text-muted-foreground text-sm">
              <span>flowos.app/</span>
              <input
                id="wsSlug"
                type="text"
                className="bg-transparent py-2 pl-1 text-foreground focus:outline-none w-full"
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
              className="w-full rounded-lg border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} aria-busy={loading}>
              {loading ? 'Provisioning...' : 'Provision Workspace'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
