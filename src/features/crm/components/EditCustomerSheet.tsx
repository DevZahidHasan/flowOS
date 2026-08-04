'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateCustomerAction } from '../actions/crm.actions';
import { Customer } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Props {
  workspaceId: string;
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCustomerSheet({ workspaceId, customer, isOpen, onClose }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [referralSource, setReferralSource] = useState('Direct');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer && isOpen) {
      setFullName(customer.fullName);
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setBirthday(customer.birthday || '');
      setReferralSource(customer.referralSource || 'Direct');
      setTags(customer.tags || []);
      setMarketingConsent(customer.marketingConsent);
      setErrorMsg(null);
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

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

    const res = await updateCustomerAction({
      workspaceId,
      customerId: customer.id,
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit Customer Profile</SheetTitle>
          <SheetDescription>
            Update customer contact details and preferences
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="eFullName">Full Name</Label>
            <Input
              id="eFullName"
              placeholder="e.g. Jessica Alba"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="eEmail">Email Address</Label>
              <Input
                id="eEmail"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ePhone">Phone Number</Label>
              <Input
                id="ePhone"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="eBirthday">Birthday</Label>
              <Input
                id="eBirthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="eReferral">Referral Source</Label>
              <select
                id="eReferral"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
                  onClick={() => handleRemoveTag(t)}
                >
                  #{t} ✕
                </Badge>
              ))}
            </div>
          </div>

          {/* Marketing Consent Toggle */}
          <div className="flex items-center justify-between p-4 rounded-md border bg-muted/50 mt-4">
            <div>
              <Label className="font-semibold text-foreground">Marketing Consent</Label>
              <p className="text-xs text-muted-foreground">Opt-in to promotional SMS & Email updates</p>
            </div>
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="h-5 w-5 rounded border-input bg-background"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t mt-4">
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
