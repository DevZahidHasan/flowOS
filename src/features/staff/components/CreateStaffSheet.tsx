'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createStaffAction } from '../actions/staff.actions';
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Add Staff Member</SheetTitle>
          <SheetDescription>
            Add an employee or team member to your roster
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
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
                  className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground border text-xs font-semibold cursor-pointer hover:bg-destructive/20 transition-colors"
                >
                  {s} ✕
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding Staff...' : 'Save Staff Member'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
