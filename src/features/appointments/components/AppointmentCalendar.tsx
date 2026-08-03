'use client';

import { useState } from 'react';
import { Appointment, ServiceItem } from '../types';
import { AppointmentCard } from './AppointmentCard';
import { CreateAppointmentSheet } from './CreateAppointmentSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Customer } from '@/features/crm/types';
import { StaffProfile } from '@/features/staff/types';

interface Props {
  workspaceId: string;
  initialAppointments: Appointment[];
  services: ServiceItem[];
  customers: Customer[];
  staffProfiles: StaffProfile[];
}

export function AppointmentCalendar({ workspaceId, initialAppointments, services, customers, staffProfiles }: Props) {
  const [filter, setFilter] = useState<'ALL' | 'SCHEDULED' | 'WALK_IN' | 'COMPLETED'>('ALL');
  const [search, setSearch] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filtered = initialAppointments.filter((apt) => {
    const matchesSearch =
      apt.customerName.toLowerCase().includes(search.toLowerCase()) ||
      apt.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      apt.staffName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'SCHEDULED') return apt.status === 'SCHEDULED' || apt.status === 'IN_PROGRESS';
    if (filter === 'WALK_IN') return apt.isWalkIn;
    if (filter === 'COMPLETED') return apt.status === 'COMPLETED';

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[44px] transition-colors ${
              filter === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-950/60 text-slate-400 hover:text-white'
            }`}
          >
            All Appointments ({initialAppointments.length})
          </button>
          <button
            onClick={() => setFilter('SCHEDULED')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[44px] transition-colors ${
              filter === 'SCHEDULED' ? 'bg-purple-600 text-white' : 'bg-slate-950/60 text-slate-400 hover:text-white'
            }`}
          >
            Active & Scheduled
          </button>
          <button
            onClick={() => setFilter('WALK_IN')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[44px] transition-colors ${
              filter === 'WALK_IN' ? 'bg-purple-600 text-white' : 'bg-slate-950/60 text-slate-400 hover:text-white'
            }`}
          >
            Walk-Ins
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[44px] transition-colors ${
              filter === 'COMPLETED' ? 'bg-purple-600 text-white' : 'bg-slate-950/60 text-slate-400 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>

        <Button onClick={() => setIsSheetOpen(true)} className="min-h-[44px] w-full sm:w-auto font-semibold">
          + Book Appointment
        </Button>
      </div>

      {/* Search Input */}
      <div className="w-full">
        <Input
          placeholder="Search by customer name, service, or staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900/60 border-white/10"
        />
      </div>

      {/* Appointment Grid */}
      {filtered.length === 0 ? (
        <div className="text-center p-12 rounded-2xl border border-white/10 bg-slate-900/40 space-y-3">
          <span className="text-4xl">📅</span>
          <h3 className="text-lg font-semibold text-white">No appointments found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            There are no appointments matching your filter. Click below to book a new appointment.
          </p>
          <Button onClick={() => setIsSheetOpen(true)} size="sm" className="min-h-[44px]">
            + Add New Appointment
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} workspaceId={workspaceId} />
          ))}
        </div>
      )}

      {/* Booking Sheet Modal */}
      <CreateAppointmentSheet
        workspaceId={workspaceId}
        services={services}
        customers={customers}
        staffProfiles={staffProfiles}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
