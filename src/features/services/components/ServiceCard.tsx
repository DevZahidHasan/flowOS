'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(service.isActive);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const nextState = !isActive;
    const res = await toggleServiceStatusAction(workspaceId, service.id, nextState);
    setLoading(false);

    if (res.error) {
      toast({
        title: 'Status Toggle Failed',
        description: res.error.message,
        variant: 'destructive',
      });
      return;
    }

    setIsActive(nextState);
    router.refresh();
  };

  return (
    <div className={`rounded-2xl border p-5 transition-all shadow-xl space-y-4 ${
      isActive ? 'bg-card text-card-foreground' : 'opacity-60 bg-muted/40'
    }`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: service.colorCode }} />
            <h3 className="font-bold text-foreground text-base tracking-tight">{service.name}</h3>
          </div>
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            {service.category}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Switch checked={isActive} disabled={loading} onCheckedChange={handleToggle} />
        </div>
      </div>

      {service.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
      )}

      {/* Pricing & Time Metrics */}
      <div className="grid grid-cols-2 gap-2 bg-muted/50 p-3 rounded-xl border text-xs text-muted-foreground">
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Price</span>
          <span className="font-bold text-foreground text-sm">${service.price.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Duration</span>
          <span className="font-bold text-foreground text-sm">⏱️ {service.durationMin} mins</span>
        </div>
      </div>
    </div>
  );
}
