import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  footerText?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  footerText,
  children,
}: EmptyStateProps) {
  return (
    <Card className="max-w-md mx-auto rounded-2xl border bg-card text-card-foreground shadow-xl py-12 px-6 text-center animate-in fade-in zoom-in-95 duration-300">
      <CardContent className="p-0 space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-muted border border-border">
            <Icon className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        </div>

        {/* Custom children */}
        {children}

        {/* Buttons / Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {action && (
              <div className="w-full sm:w-auto min-h-[44px] flex items-center justify-center">
                {action}
              </div>
            )}
            {secondaryAction && (
              <div className="w-full sm:w-auto min-h-[44px] flex items-center justify-center">
                {secondaryAction}
              </div>
            )}
          </div>
        )}

        {/* Optional Footer Text */}
        {footerText && (
          <p className="text-xs text-muted-foreground pt-2">{footerText}</p>
        )}
      </CardContent>
    </Card>
  );
}
