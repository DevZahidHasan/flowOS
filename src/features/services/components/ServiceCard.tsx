'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Service } from '../types';
import { toggleServiceStatusAction } from '../actions/services.actions';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface Props {
  service: Service;
  workspaceId: string;
}

export function ServiceCard({ service, workspaceId }: Props) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(service.isActive);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const nextState = !isActive;
    const res = await toggleServiceStatusAction(workspaceId, service.id, nextState);
    setLoading(false);

    if (res.error) {
      alert(res.error.message);
      return;
    }

    setIsActive(nextState);
    router.refresh();
  };

  return (
    <div className={`rounded-2xl border p-5 transition-all shadow-xl space-y-4 ${
      isActive ? 'border-white/10 bg-slate-900/80' : 'border-white/5 bg-slate-950/40 opacity-60'
    }`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: service.colorCode }} />
            <h3 className="font-bold text-white text-base tracking-tight">{service.name}</h3>
          </div>
          <Badge variant="outline" className="text-[10px] text-slate-400 border-white/10">
            {service.category}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Switch checked={isActive} disabled={loading} onCheckedChange={handleToggle} />
        </div>
      </div>

      {service.description && (
        <p className="text-xs text-slate-400 line-clamp-2">{service.description}</p>
      )}

      {/* Pricing & Time Metrics */}
      <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-white/5 text-xs">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Price</span>
          <span className="font-bold text-purple-300 text-sm">${service.price.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Duration</span>
          <span className="font-bold text-white text-sm">⏱️ {service.durationMin} mins</span>
        </div>
      </div>
    </div>
  );
}
