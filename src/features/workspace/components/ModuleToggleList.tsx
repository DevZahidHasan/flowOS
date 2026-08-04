'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { toggleModuleAction } from '../actions/workspace.actions';
import { WorkspaceModule, ModuleKey } from '@/types/global';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MODULE_META: Record<ModuleKey, { title: string; description: string; icon: string }> = {
  appointments: {
    title: 'Appointments & Scheduling',
    description: 'Booking calendar, recurring slots, rescheduling, walk-in scheduling.',
    icon: '📅',
  },
  queue: {
    title: 'Queue Management',
    description: 'Realtime token generation, live display, and waitlist management.',
    icon: '🎟️',
  },
  crm: {
    title: 'Customer CRM',
    description: 'Customer profiles, history, notes, tags, and loyalty rewards.',
    icon: '👥',
  },
  services: {
    title: 'Services & Pricing',
    description: 'Catalog of business services, variable durations, and pricing tiers.',
    icon: '💼',
  },
  staff: {
    title: 'Staff & Working Hours',
    description: 'Roster management, commissions, leave tracking, and performance.',
    icon: '👨‍💼',
  },
  projects: {
    title: 'Projects & Kanban Tasks',
    description: 'Task boards, milestone tracking, and team collaboration.',
    icon: '📊',
  },
  invoices: {
    title: 'Invoicing & Payments',
    description: 'Line-item invoicing, tax calculation, and payment records.',
    icon: '💳',
  },
  courses: {
    title: 'Courses & Attendance',
    description: 'Class scheduling, student rosters, certificates, and attendance tracking.',
    icon: '🎓',
  },
  office: {
    title: 'Office Management',
    description: 'Employee directory, meeting room bookings, and visitor logs.',
    icon: '🏢',
  },
  inventory: {
    title: 'Inventory & Products',
    description: 'Product catalog, stock level alerts, and supplier management.',
    icon: '📦',
  },
  reports: {
    title: 'Reports & Analytics',
    description: 'Daily, weekly, and monthly financial and operational analytics.',
    icon: '📈',
  },
  ai: {
    title: 'AI Business Assistant',
    description: 'Proposal writer, marketing assistant, customer summaries, and insights.',
    icon: '🤖',
  },
};

interface Props {
  workspaceId: string;
  initialModules: WorkspaceModule[];
}

export function ModuleToggleList({ workspaceId, initialModules }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [modules, setModules] = useState<WorkspaceModule[]>(initialModules);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const handleToggle = async (moduleKey: ModuleKey, currentStatus: boolean) => {
    setUpdatingKey(moduleKey);

    const res = await toggleModuleAction({
      workspaceId,
      moduleKey,
      isEnabled: !currentStatus,
    });

    setUpdatingKey(null);

    if (res.error) {
      toast({
        title: 'Module Toggle Failed',
        description: res.error.message,
        variant: 'destructive',
      });
      return;
    }

    setModules((prev) =>
      prev.map((m) => (m.moduleKey === moduleKey ? { ...m, isEnabled: !currentStatus } : m))
    );

    router.refresh();
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(MODULE_META).map(([key, meta]) => {
        const moduleKey = key as ModuleKey;
        const mod = modules.find((m) => m.moduleKey === moduleKey);
        const isEnabled = mod ? mod.isEnabled : false;
        const isUpdating = updatingKey === moduleKey;

        return (
          <Card
            key={moduleKey}
            className={`transition-all duration-200 ${
              isEnabled ? 'border-primary/40 shadow-sm' : 'opacity-70'
            }`}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-3">
                <span className="text-2xl" aria-hidden="true">{meta.icon}</span>
                <div>
                  <CardTitle className="text-base font-semibold">{meta.title}</CardTitle>
                  <Badge variant={isEnabled ? 'secondary' : 'outline'} className="mt-1">
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              <Switch
                checked={isEnabled}
                disabled={isUpdating}
                onCheckedChange={() => handleToggle(moduleKey, isEnabled)}
                aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${meta.title}`}
              />
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs text-muted-foreground mt-2">
                {meta.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
