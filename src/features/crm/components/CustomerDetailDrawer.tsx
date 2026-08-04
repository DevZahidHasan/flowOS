'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Customer, CustomerNote, CustomerTimelineEvent } from '../types';
import { addCustomerNoteAction, getCustomerDetailsAction } from '../actions/crm.actions';
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
  const [details, setDetails] = useState<{ notes: CustomerNote[]; timeline: CustomerTimelineEvent[] }>({ notes: [], timeline: [] });
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'NOTES' | 'INFO'>('TIMELINE');
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (!customer) return;
    async function fetchDetails() {
      if (!customer) return;
      const res = await getCustomerDetailsAction(workspaceId, customer.id);
      if (res.data) {
        setDetails({ notes: res.data.notes, timeline: res.data.timeline });
      }
    }
    fetchDetails();
  }, [customer, workspaceId]);

  if (!customer) return null;

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
      alert(res.error.message);
      return;
    }

    setNewNote('');
    setDetails((prev) => ({ ...prev, notes: [res.data, ...prev.notes] }));
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-black/75 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-xl h-full sm:h-[90vh] rounded-t-3xl sm:rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-5 flex flex-col justify-between overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 font-bold text-white text-lg">
              {customer.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{customer.fullName}</h2>
              <p className="text-xs text-slate-400">{customer.email || customer.phone || 'Customer Profile'}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditOpen(true)}
              className="text-slate-400 hover:text-white text-sm min-h-[44px] px-3 flex items-center justify-center rounded-xl bg-slate-800"
            >
              Edit Profile
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-sm min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold min-h-[44px] ${
              activeTab === 'TIMELINE' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            📜 Activity Timeline ({details.timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('NOTES')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold min-h-[44px] ${
              activeTab === 'NOTES' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            📝 Internal Notes ({details.notes.length})
          </button>
          <button
            onClick={() => setActiveTab('INFO')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold min-h-[44px] ${
              activeTab === 'INFO' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            👤 Profile Info
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {activeTab === 'TIMELINE' && (
            <div className="space-y-3">
              {details.timeline.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">No timeline events recorded yet.</p>
              ) : (
                details.timeline.map((evt) => (
                  <div key={evt.id} className="flex space-x-3 p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs">
                    <span className="text-base">🔹</span>
                    <div>
                      <h4 className="font-semibold text-white">{evt.title}</h4>
                      <p className="text-slate-400">{evt.description}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
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
                  placeholder="Add internal staff note about preferences, allergies, etc..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-slate-950/60"
                />
                <Button type="submit" disabled={loading} size="sm" className="w-full min-h-[44px]">
                  + Post Note
                </Button>
              </form>

              <div className="space-y-2">
                {details.notes.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs space-y-1">
                    <p className="text-slate-200">{n.note}</p>
                    <span className="text-[10px] text-purple-400 block font-medium">
                      By {n.authorName} • {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'INFO' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">Customer Metrics</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <p>Total Visits: <strong className="text-white">{customer.totalVisits}</strong></p>
                  <p>Lifetime Spent: <strong className="text-purple-300">${customer.lifetimeSpending}</strong></p>
                  <p>Loyalty Points: <strong className="text-emerald-400">{customer.loyaltyPoints}</strong></p>
                  <p>Referral: <strong className="text-white">{customer.referralSource}</strong></p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">Preferences & Consent</h4>
                <p className="text-slate-300">
                  Preferred Staff: <strong className="text-white">{customer.preferredStaffName || 'None'}</strong>
                </p>
                <p className="text-slate-300">
                  Marketing Consent: <Badge variant={customer.marketingConsent ? 'secondary' : 'outline'}>
                    {customer.marketingConsent ? 'Granted' : 'Opted-Out'}
                  </Badge>
                </p>
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
