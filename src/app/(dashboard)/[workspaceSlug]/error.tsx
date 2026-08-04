'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Log the error to an external logging service in production (e.g. Sentry)
    console.error('Captured App Error boundary:', error);
    
    // Move screen reader focus into the error boundary container immediately
    const timer = setTimeout(() => {
      containerRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-title"
      aria-describedby="error-description"
      className="min-h-[70vh] flex items-center justify-center p-4 outline-none"
    >
      <Card className="max-w-md w-full border border-destructive/20 bg-destructive/5 shadow-2xl p-6 text-center rounded-2xl">
        <CardContent className="p-0 space-y-6">
          {/* Danger Alert Icon */}
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20" aria-hidden="true">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>

          {/* Error Text Message */}
          <div className="space-y-2">
            <h2 id="error-title" className="text-xl font-bold text-foreground tracking-tight">Something went wrong</h2>
            <p id="error-description" className="text-sm text-muted-foreground leading-relaxed">
              An unexpected error occurred while loading this dashboard. We have logged the issue and are working to resolve it.
            </p>
            {error.message && (
              <p className="text-xs font-mono bg-destructive/10 text-destructive p-2.5 rounded-lg border border-destructive/10 break-all select-all">
                {error.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => reset()}
              className="w-full sm:w-auto font-semibold min-h-[44px]"
              aria-label="Try loading the dashboard again"
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" /> Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto font-semibold min-h-[44px]"
              aria-label="Reload current webpage"
            >
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
