'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAppointmentAction } from '../actions/appointments.actions';
import { ServiceItem } from '../types';
import { Customer } from '@/features/crm/types';
import { StaffMember } from '@/features/staff/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  workspaceId: string;
  services: ServiceItem[];
  customers: Customer[];
  staffProfiles: StaffMember[];
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAppointmentSheet({ workspaceId, services, customers, staffProfiles, isOpen, onClose }: Props) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const [serviceName, setServiceName] = useState(services[0]?.name || 'Standard Consultation');
  const [serviceId, setServiceId] = useState<string>(services[0]?.id || '');
  const [durationMin, setDurationMin] = useState(services[0]?.durationMin || 30);
  
  const [staffId, setStaffId] = useState<string>('');
  const [staffName, setStaffName] = useState('Any Available Staff');
  
  const [startTime, setStartTime] = useState(new Date().toISOString().substring(0, 16));
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleServiceSelect = (id: string) => {
    setServiceId(id);
    const found = services.find((s) => s.id === id);
    if (found) {
      setServiceName(found.name);
      setDurationMin(found.durationMin);
    }
  };

  const handleCustomerSelect = (val: string) => {
    if (val === 'new') {
      setCustomerId('');
      setCustomerName('');
      setCustomerPhone('');
    } else {
      setCustomerId(val);
      const c = customers.find(x => x.id === val);
      if (c) {
        setCustomerName(c.fullName);
        setCustomerPhone(c.phone || '');
      }
    }
  };

  const handleStaffSelect = (val: string) => {
    setStaffId(val);
    if (val === '') {
      setStaffName('Any Available Staff');
    } else {
      const s = staffProfiles.find(x => x.id === val);
      if (s) {
        setStaffName(s.displayName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await createAppointmentAction({
      workspaceId,
      customerId: customerId || undefined,
      customerName,
      customerPhone,
      serviceId: serviceId || undefined,
      serviceName,
      staffId: staffId || undefined,
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
            <Label htmlFor="customerSelect">Select Customer</Label>
            <select
              id="customerSelect"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-base md:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
              value={customerId || 'new'}
              onChange={(e) => handleCustomerSelect(e.target.value)}
            >
              <option value="new">+ New Walk-in / Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} {c.phone ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {!customerId && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="custName">New Customer Name</Label>
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
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="service">Service Category</Label>
              {services.length > 0 ? (
                <select
                  id="service"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-base md:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
                  value={serviceId}
                  onChange={(e) => handleServiceSelect(e.target.value)}
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
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
              <select
                  id="staff"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-base md:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
                  value={staffId}
                  onChange={(e) => handleStaffSelect(e.target.value)}
                >
                  <option value="">Any Available Staff</option>
                  {staffProfiles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.displayName} ({s.roleTitle})
                    </option>
                  ))}
              </select>
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
