'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createStaffAction } from '../actions/staff.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateStaffSheet({ workspaceId, isOpen, onClose }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Senior Specialist');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState('15');
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [specialties, setSpecialties] = useState<string[]>(['Haircut', 'Coloring']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddSpecialty = () => {
    if (specialtyInput.trim() && !specialties.includes(specialtyInput.trim())) {
      setSpecialties([...specialties, specialtyInput.trim()]);
      setSpecialtyInput('');
    }
  };

  const handleRemoveSpecialty = (spec: string) => {
    setSpecialties(specialties.filter((s) => s !== spec));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await createStaffAction({
      workspaceId,
      displayName,
      roleTitle,
      email,
      phone,
      commissionRate: Number(commissionRate),
      specialties,
      isActive: true,
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
            <h2 className="text-lg font-bold text-white">Add Staff Member</h2>
            <p className="text-xs text-slate-400">Add an employee or team member to your roster</p>
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
            <Label htmlFor="stName">Display Name</Label>
            <Input
              id="stName"
              placeholder="e.g. Marcus Vance"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="stRole">Role / Job Title</Label>
              <Input
                id="stRole"
                placeholder="e.g. Master Stylist"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stCommission">Commission Rate (%)</Label>
              <Input
                id="stCommission"
                type="number"
                step="0.5"
                placeholder="15"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="stEmail">Work Email</Label>
              <Input
                id="stEmail"
                type="email"
                placeholder="staff@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stPhone">Phone Number</Label>
              <Input
                id="stPhone"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-2">
            <Label>Staff Specialties</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="e.g. Haircut, Color, Massage"
                value={specialtyInput}
                onChange={(e) => setSpecialtyInput(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={handleAddSpecialty} className="min-h-[44px]">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {specialties.map((s) => (
                <span
                  key={s}
                  onClick={() => handleRemoveSpecialty(s)}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold cursor-pointer hover:bg-red-500/20 transition-colors"
                >
                  {s} ✕
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-h-[44px]">
              {loading ? 'Adding Staff...' : 'Save Staff Member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
