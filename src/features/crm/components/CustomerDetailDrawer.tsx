'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Customer, CustomerNote, CustomerTimelineEvent } from '../types';
import { addCustomerNoteAction, getCustomerDetailsAction, deleteCustomerAction } from '../actions/crm.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EditCustomerSheet } from './EditCustomerSheet';

interface Props {
  workspaceId: string;
  customer: Customer | null;
  onClose: () => void;
}

export function CustomerDetailDrawer({ workspaceId, customer, onClose }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [details, setDetails] = useState<{ notes: CustomerNote[]; timeline: CustomerTimelineEvent[] }>({ notes: [], timeline: [] });
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'NOTES' | 'INFO'>('TIMELINE');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!customer) return;

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
  }, [customer, onClose]);

  const loadDetails = useCallback(async () => {
    if (!customer) return;
    const res = await getCustomerDetailsAction(workspaceId, customer.id);
    if (res.data) {
      setDetails({ notes: res.data.notes, timeline: res.data.timeline });
    }
  }, [customer, workspaceId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  if (!customer) return null;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this customer and all their notes/timeline history?')) return;
    setIsDeleting(true);
    const res = await deleteCustomerAction(workspaceId, customer.id);
    setIsDeleting(false);
    if (res.error) {
      toast({
        title: 'Delete Failed',
        description: res.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Customer deleted',
        description: 'Customer profile has been permanently removed.',
      });
      onClose();
      router.refresh();
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setLoading(true);
    const res = await addCustomerNoteAction({
      workspaceId,
      customerId: customer.id,
      note: newNote,
      authorName: 'Staff Member',
    });
    setLoading(false);

    if (res.error) {
      toast({
        title: 'Note creation failed',
        description: res.error.message,
        variant: 'destructive',
      });
      return;
    }

    setNewNote('');
    await loadDetails();
    router.refresh();
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="drawer-title" className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full sm:h-[90vh] rounded-t-3xl sm:rounded-2xl border bg-card text-card-foreground p-6 shadow-2xl space-y-5 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-250">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 font-bold text-white text-lg">
              {customer.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 id="drawer-title" className="text-lg font-bold text-foreground">{customer.fullName}</h2>
              <p className="text-xs text-muted-foreground">{customer.email || customer.phone || 'Customer Profile'}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditOpen(true)}
              aria-label="Edit customer profile"
              className="text-muted-foreground hover:text-foreground text-sm min-h-[44px] px-3 flex items-center justify-center rounded-xl bg-muted transition-colors duration-150"
            >
              Edit Profile
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Delete customer"
              className="text-destructive hover:text-destructive text-sm min-h-[44px] px-3 flex items-center justify-center rounded-xl bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 transition-colors duration-150"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
             <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close customer details"
              className="text-muted-foreground hover:text-foreground text-sm min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-muted transition-colors duration-150"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div role="tablist" aria-label="Customer information tabs" className="flex items-center space-x-2 border-b pb-2">
          <button
            role="tab"
            aria-selected={activeTab === 'TIMELINE'}
            onClick={() => setActiveTab('TIMELINE')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold min-h-[44px] ${
              activeTab === 'TIMELINE' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📜 Activity Timeline ({details.timeline.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'NOTES'}
            onClick={() => setActiveTab('NOTES')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold min-h-[44px] ${
              activeTab === 'NOTES' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📝 Internal Notes ({details.notes.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'INFO'}
            onClick={() => setActiveTab('INFO')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold min-h-[44px] ${
              activeTab === 'INFO' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            👤 Profile Info
          </button>
        </div>

        {/* Tab Content */}
        <div role="tabpanel" className="flex-1 overflow-y-auto pr-1 space-y-4">
          {activeTab === 'TIMELINE' && (
            <div className="space-y-3">
              {details.timeline.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">No timeline events recorded yet.</p>
              ) : (
                details.timeline.map((evt) => (
                  <div key={evt.id} className="flex space-x-3 p-3 rounded-xl bg-muted/50 border text-xs">
                    <span className="text-base">🔹</span>
                    <div>
                      <h4 className="font-semibold text-foreground">{evt.title}</h4>
                      <p className="text-muted-foreground">{evt.description}</p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {new Date(evt.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'NOTES' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="space-y-2">
                <Input
                  aria-label="Add internal note"
                  placeholder="Add internal staff note about preferences, allergies, etc..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-muted/30"
                />
                <Button type="submit" disabled={loading} aria-busy={loading} size="sm" className="w-full min-h-[44px]">
                  + Post Note
                </Button>
              </form>

              <div className="space-y-2">
                {details.notes.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-muted/50 border text-xs space-y-1">
                    <p className="text-foreground">{n.note}</p>
                    <span className="text-[10px] text-primary block font-medium">
                      By {n.authorName} • {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'INFO' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/50 border space-y-2">
                <h4 className="font-bold text-foreground text-sm">Customer Metrics</h4>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <p>Total Visits: <strong className="text-foreground">{customer.totalVisits}</strong></p>
                  <p>Lifetime Spent: <strong className="text-primary">${customer.lifetimeSpending}</strong></p>
                  <p>Loyalty Points: <strong className="text-primary">{customer.loyaltyPoints}</strong></p>
                  <p>Referral: <strong className="text-foreground">{customer.referralSource}</strong></p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 border space-y-2">
                <h4 className="font-bold text-foreground text-sm">Preferences & Consent</h4>
                <p className="text-muted-foreground">
                  Preferred Staff: <strong className="text-foreground">{customer.preferredStaffName || 'None'}</strong>
                </p>
                <div className="text-muted-foreground text-sm">
                  Marketing Consent: <Badge variant={customer.marketingConsent ? 'secondary' : 'outline'}>
                    {customer.marketingConsent ? 'Granted' : 'Opted-Out'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <EditCustomerSheet
        workspaceId={workspaceId}
        customer={customer}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </div>
  );
}
