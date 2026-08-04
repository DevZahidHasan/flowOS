'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

type Tab = {
  id: string;
  label: string;
  icon: string;
  comingSoon?: boolean;
};

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'document', label: 'Document', icon: '📄' },
  { id: 'line-items', label: 'Line Items', icon: '📦' },
  { id: 'payments', label: 'Payments', icon: '💳' },
  { id: 'activity', label: 'Activity', icon: '⏱' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'attachments', label: 'Attachments', icon: '📎', comingSoon: true },
];

interface Props {
  activeTab: string;
}

export function InvoiceTabs({ activeTab }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div
      className="flex gap-0.5 border-b overflow-x-auto"
      role="tablist"
      aria-label="Invoice sections"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => !tab.comingSoon && handleTabChange(tab.id)}
            disabled={tab.comingSoon}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'min-h-[44px]',
              isActive
                ? 'text-foreground border-b-2 border-primary -mb-px'
                : 'text-muted-foreground hover:text-foreground',
              tab.comingSoon && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
            {tab.comingSoon && (
              <span className="ml-1 text-[10px] uppercase tracking-wide font-semibold text-muted-foreground border border-border rounded px-1 py-0.5">
                Soon
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
