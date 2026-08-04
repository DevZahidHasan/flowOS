'use client';

import { useState } from 'react';
import { Appointment, ServiceItem } from '../types';
import { AppointmentCard } from './AppointmentCard';
import { CreateAppointmentSheet } from './CreateAppointmentSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Customer } from '@/features/crm/types';
import { StaffMember } from '@/features/staff/types';

interface Props {
  workspaceId: string;
  initialAppointments: Appointment[];
  services: ServiceItem[];
  customers: Customer[];
  staffProfiles: StaffMember[];
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={filter === 'ALL' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilter('ALL')}
            className="whitespace-nowrap"
          >
            All ({initialAppointments.length})
          </Button>
          <Button
            variant={filter === 'SCHEDULED' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilter('SCHEDULED')}
            className="whitespace-nowrap"
          >
            Active & Scheduled
          </Button>
          <Button
            variant={filter === 'WALK_IN' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilter('WALK_IN')}
            className="whitespace-nowrap"
          >
            Walk-Ins
          </Button>
          <Button
            variant={filter === 'COMPLETED' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilter('COMPLETED')}
            className="whitespace-nowrap"
          >
            Completed
          </Button>
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
          className="max-w-md"
        />
      </div>

      {/* Appointment Grid */}
      {filtered.length === 0 ? (
        <div className="text-center p-12 space-y-3">
          <span className="text-4xl text-muted-foreground">📅</span>
          <h3 className="text-lg font-semibold text-foreground">No appointments found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            There are no appointments matching your filter. Click below to book a new appointment.
          </p>
          <Button onClick={() => setIsSheetOpen(true)} size="sm">
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
