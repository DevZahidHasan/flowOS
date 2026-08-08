import { Button } from '@/components/ui/button';
import { Copy, RefreshCw, Trash2, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AIResultPanelProps {
  title: string;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onClear?: () => void;
  isLoading: boolean;
  loadingText?: string;
  error: string | null;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export function AIResultPanel({
  title,
  onCopy,
  onRegenerate,
  onClear,
  isLoading,
  loadingText = 'Generating...',
  error,
  isEmpty = false,
  emptyTitle = 'AI Assistant Ready',
  emptyDescription = 'Select an option and run generation to produce content.',
  emptyIcon = <Sparkles className="h-8 w-8 text-primary" />,
  children,
}: AIResultPanelProps) {
  return (
    <Card className="bg-card/45 backdrop-blur-md border-border/40 overflow-hidden min-h-[400px] flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/20 shrink-0">
        <h3 className="font-semibold text-foreground text-sm tracking-wide uppercase flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          {title}
        </h3>
        
        <div className="flex items-center gap-1">
          {onCopy && children && !isLoading && !error && !isEmpty && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCopy} title="Copy Content">
              <Copy className="h-4 w-4" />
            </Button>
          )}
          {onRegenerate && children && !isLoading && !error && !isEmpty && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRegenerate} title="Regenerate Content">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {onClear && (children || error) && !isLoading && !isEmpty && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onClear} title="Clear Result">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <CardContent className="flex-1 flex flex-col p-5 overflow-y-auto relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10 transition-all">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">{loadingText}</p>
          </div>
        )}

        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h4 className="font-semibold text-foreground text-base">Generation Failed</h4>
            <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
          </div>
        ) : isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3 opacity-80">
            <div className="h-16 w-16 rounded-full bg-muted/40 flex items-center justify-center mb-1">
              {emptyIcon}
            </div>
            <h4 className="font-semibold text-foreground text-base">{emptyTitle}</h4>
            <p className="text-sm text-muted-foreground max-w-xs">{emptyDescription}</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 w-full select-text">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
