import { Skeleton } from '@/components/ui/skeleton';

export function ExpenseSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-card/25 backdrop-blur-md border border-border/40 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl bg-muted/40" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-muted/40" />
              <Skeleton className="h-3 w-24 bg-muted/40" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16 bg-muted/40" />
            <Skeleton className="h-8 w-8 rounded-xl bg-muted/40" />
          </div>
        </div>
      ))}
    </div>
  );
}
