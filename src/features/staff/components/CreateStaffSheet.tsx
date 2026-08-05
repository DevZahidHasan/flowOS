'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createStaffAction, updateStaffAction } from '../actions/staff.actions';
import { StaffMember } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

interface Props {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  staff?: StaffMember | null; // If provided, we are in Edit mode
}

export function CreateStaffSheet({ workspaceId, isOpen, onClose, staff }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Senior Specialist');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState('15');
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [specialties, setSpecialties] = useState<string[]>(['Haircut', 'Coloring']);
  const [skills, setSkills] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditMode = !!staff;

  useEffect(() => {
    if (staff) {
      setDisplayName(staff.displayName);
      setRoleTitle(staff.roleTitle);
      setEmail(staff.email || '');
      setPhone(staff.phone || '');
      setCommissionRate(String(staff.commissionRate));
      setSpecialties(staff.specialties || []);
      setSkills(staff.skills || []);
      setIsActive(staff.isActive);
    } else {
      setDisplayName('');
      setRoleTitle('Senior Specialist');
      setEmail('');
      setPhone('');
      setCommissionRate('15');
      setSpecialties(['Haircut', 'Coloring']);
      setSkills([]);
      setIsActive(true);
    }
    setErrorMsg(null);
  }, [staff, isOpen]);

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

    const payload = {
      workspaceId,
      displayName,
      roleTitle,
      email: email || null,
      phone: phone || null,
      commissionRate: Number(commissionRate),
      specialties,
      skills,
      isActive,
    };

    let res;
    if (isEditMode && staff) {
      res = await updateStaffAction({
        ...payload,
        staffId: staff.id,
      });
    } else {
      res = await createStaffAction(payload);
    }

    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    toast({
      title: isEditMode ? 'Staff member updated' : 'Staff member added',
      description: `Successfully ${isEditMode ? 'updated' : 'added'} "${displayName}"`,
    });

    onClose();
    router.refresh();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-card text-card-foreground border-l">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-foreground">{isEditMode ? 'Edit Staff Member' : 'Add Staff Member'}</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {isEditMode ? 'Modify employee or team member roster details.' : 'Add an employee or team member to your roster.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div role="alert" className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="stName" className="text-foreground">Display Name *</Label>
            <Input
              id="stName"
              placeholder="e.g. Marcus Vance"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-background border-input text-foreground"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="stRole" className="text-foreground">Role / Job Title *</Label>
              <Input
                id="stRole"
                placeholder="e.g. Master Stylist"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="bg-background border-input text-foreground"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stCommission" className="text-foreground">Commission Rate (%)</Label>
              <Input
                id="stCommission"
                type="number"
                step="0.5"
                placeholder="15"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="bg-background border-input text-foreground"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="stEmail" className="text-foreground">Work Email</Label>
              <Input
                id="stEmail"
                type="email"
                placeholder="staff@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-input text-foreground"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stPhone" className="text-foreground">Phone Number</Label>
              <Input
                id="stPhone"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-background border-input text-foreground"
                disabled={loading}
              />
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-2">
            <Label className="text-foreground">Staff Specialties</Label>
            <div className="flex space-x-2">
              <Input
                aria-label="Add staff specialty"
                placeholder="e.g. Haircut, Color, Massage"
                value={specialtyInput}
                onChange={(e) => setSpecialtyInput(e.target.value)}
                className="bg-background border-input text-foreground"
                disabled={loading}
              />
              <Button type="button" variant="outline" onClick={handleAddSpecialty} className="min-h-[44px]" disabled={loading}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {specialties.map((s) => (
                <button
                  type="button"
                  aria-label={`Remove specialty ${s}`}
                  key={s}
                  onClick={() => handleRemoveSpecialty(s)}
                  className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground border text-xs font-semibold cursor-pointer hover:bg-destructive/20 transition-colors"
                  disabled={loading}
                >
                  {s} ✕
                </button>
              ))}
            </div>
          </div>

          {isEditMode && (
            <div className="flex items-center space-x-2 pt-2">
              <input
                id="stActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary bg-background"
                disabled={loading}
              />
              <Label htmlFor="stActive" className="text-foreground cursor-pointer select-none">Active roster member (uncheck to set on leave)</Label>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="min-h-[44px]">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} aria-busy={loading} className="bg-primary text-primary-foreground min-h-[44px]">
              {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save Staff Member'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
