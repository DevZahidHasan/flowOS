'use client';

import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ExportInvoiceButton() {
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: 'Preparing PDF Export',
      description: 'Opening print dialog. Please choose "Save as PDF" as the destination.',
    });
    
    // Smooth delay so the toast shows up before blocking UI print dialog
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 focus-visible:ring-2 focus-visible:ring-ring"
      onClick={handleExport}
      aria-label="Export invoice to PDF"
    >
      <FileDown className="h-4 w-4" />
      Export PDF
    </Button>
  );
}
