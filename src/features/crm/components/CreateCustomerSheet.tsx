'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomerAction } from '../actions/crm.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCustomerSheet({ workspaceId, isOpen, onClose }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [referralSource, setReferralSource] = useState('Direct');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['VIP']);
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await createCustomerAction({
      workspaceId,
      fullName,
      email,
      phone,
      birthday,
      referralSource,
      tags,
      marketingConsent,
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
            <h2 className="text-lg font-bold text-white">Add New Customer</h2>
            <p className="text-xs text-slate-400">Create a customer profile for tracking & marketing</p>
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
            <Label htmlFor="cFullName">Full Name</Label>
            <Input
              id="cFullName"
              placeholder="e.g. Jessica Alba"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cEmail">Email Address</Label>
              <Input
                id="cEmail"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cPhone">Phone Number</Label>
              <Input
                id="cPhone"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cBirthday">Birthday</Label>
              <Input
                id="cBirthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cReferral">Referral Source</Label>
              <select
                id="cReferral"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-base md:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
              >
                <option value="Direct">Direct / Walk-In</option>
                <option value="Social Media">Social Media</option>
                <option value="Friend Referral">Friend Referral</option>
                <option value="Google Search">Google Search</option>
              </select>
            </div>
          </div>

          {/* Tags Manager */}
          <div className="space-y-2">
            <Label>Customer Tags</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="e.g. VIP, Regular, Student"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={handleAddTag} className="min-h-[44px]">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t) => (
                <span
                  key={t}
                  onClick={() => handleRemoveTag(t)}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold cursor-pointer hover:bg-red-500/20 transition-colors"
                >
                  #{t} ✕
                </span>
              ))}
            </div>
          </div>

          {/* Marketing Consent Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/10">
            <div>
              <Label className="font-semibold text-white">Marketing Consent</Label>
              <p className="text-xs text-slate-400">Opt-in to promotional SMS & Email updates</p>
            </div>
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="h-6 w-6 rounded border-white/10 bg-slate-900 text-purple-600 focus:ring-purple-500"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-h-[44px]">
              {loading ? 'Saving...' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
