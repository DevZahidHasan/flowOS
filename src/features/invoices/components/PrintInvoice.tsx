'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export function PrintInvoice() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 focus-visible:ring-2 focus-visible:ring-ring"
      onClick={handlePrint}
      aria-label="Print Invoice"
    >
      <Printer className="h-4 w-4" />
      Print
    </Button>
  );
}
