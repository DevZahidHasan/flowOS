'use client';

import { useState } from 'react';
import { CarePlanner } from './CarePlanner';
import { ServiceCatalogGenerator } from './ServiceCatalogGenerator';
import { MarketingCopywriter } from './MarketingCopywriter';
import { MeetingNotesExtractor } from './MeetingNotesExtractor';
import { Sparkles, Heart, Library, Megaphone, ClipboardList } from 'lucide-react';

interface Props {
  workspaceId: string;
  workspaceSlug: string;
}

type TabType = 'care' | 'catalog' | 'marketing' | 'notes';

export function AIDashboardClient({ workspaceId, workspaceSlug }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('care');

  const tabs = [
    {
      id: 'care' as TabType,
      title: 'Care & Follow-up Planner',
      description: 'Draft custom post-treatment instructions and warning guidelines.',
      icon: <Heart className="h-5 w-5" />,
    },
    {
      id: 'catalog' as TabType,
      title: 'Service Catalog Generator',
      description: 'Generate optimized service ideas and add them to your catalog.',
      icon: <Library className="h-5 w-5" />,
    },
    {
      id: 'marketing' as TabType,
      title: 'Marketing Copywriter',
      description: 'Generate high-converting copy for social media and emails.',
      icon: <Megaphone className="h-5 w-5" />,
    },
    {
      id: 'notes' as TabType,
      title: 'Meeting Notes ➔ Tasks',
      description: 'Extract action items and insert them into your task list.',
      icon: <ClipboardList className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/25 backdrop-blur-md border border-border/40 p-6 rounded-2xl shadow-md">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            AI Business Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Turn your business data and ideas into useful work in seconds.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            AI Ready
          </span>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-start text-left p-5 rounded-xl border transition-all relative ${
                isActive
                  ? 'bg-primary/5 border-primary/60 shadow-md shadow-primary/5'
                  : 'bg-card/40 border-border/40 hover:border-border/80 hover:bg-card/60'
              }`}
            >
              {isActive && (
                <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
              )}
              <div className={`p-2 rounded-lg mb-3 ${isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {tab.icon}
              </div>
              <h3 className="font-semibold text-foreground text-sm leading-none mb-1.5">
                {tab.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-normal">
                {tab.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Feature Workspace */}
      <div className="mt-8 transition-all duration-300">
        {activeTab === 'care' && <CarePlanner workspaceId={workspaceId} />}
        {activeTab === 'catalog' && <ServiceCatalogGenerator workspaceId={workspaceId} />}
        {activeTab === 'marketing' && <MarketingCopywriter workspaceId={workspaceId} />}
        {activeTab === 'notes' && <MeetingNotesExtractor workspaceId={workspaceId} />}
      </div>
    </div>
  );
}
