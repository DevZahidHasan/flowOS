'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAppointmentAction } from '../actions/appointments.actions';
import { ServiceItem } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  workspaceId: string;
  services: ServiceItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAppointmentSheet({ workspaceId, services, isOpen, onClose }: Props) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceName, setServiceName] = useState(services[0]?.name || 'Standard Consultation');
  const [durationMin, setDurationMin] = useState(services[0]?.durationMin || 30);
  const [staffName, setStaffName] = useState('Any Available Staff');
  const [startTime, setStartTime] = useState(new Date().toISOString().substring(0, 16));
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleServiceSelect = (name: string) => {
    setServiceName(name);
    const found = services.find((s) => s.name === name);
    if (found) {
      setDurationMin(found.durationMin);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await createAppointmentAction({
      workspaceId,
      customerName,
      customerPhone,
      serviceName,
      staffName,
      startTime: new Date(startTime).toISOString(),
      durationMin: Number(durationMin),
      isWalkIn,
      notes,
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Book Appointment</h2>
            <p className="text-xs text-slate-400">Schedule a service or record a walk-in</p>
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

          {/* Walk In Quick Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/10">
            <div>
              <Label className="font-semibold text-white">Quick Walk-In Customer</Label>
              <p className="text-xs text-slate-400">Mark as walk-in for instant service</p>
            </div>
            <input
              type="checkbox"
              checked={isWalkIn}
              onChange={(e) => setIsWalkIn(e.target.checked)}
              className="h-6 w-6 rounded border-white/10 bg-slate-900 text-purple-600 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="custName">Customer Full Name</Label>
            <Input
              id="custName"
              placeholder="e.g. Sarah Jenkins"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="custPhone">Phone Number (Optional)</Label>
            <Input
              id="custPhone"
              placeholder="+1 (555) 000-0000"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="service">Service Category</Label>
              {services.length > 0 ? (
                <select
                  id="service"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-base md:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
                  value={serviceName}
                  onChange={(e) => handleServiceSelect(e.target.value)}
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.durationMin}m - ${s.price})
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  placeholder="e.g. Haircut & Styling"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff">Assigned Staff</Label>
              <Input
                id="staff"
                placeholder="e.g. Alex Morgan"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="start">Date & Time</Label>
            <Input
              id="start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes / Special Requests</Label>
            <Input
              id="notes"
              placeholder="e.g. Prefers window chair, first time customer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto min-h-[44px]">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto min-h-[44px]">
              {loading ? 'Scheduling...' : 'Confirm Appointment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
