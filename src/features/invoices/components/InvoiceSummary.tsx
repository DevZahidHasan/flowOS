'use client';

import { Card, CardContent } from '@/components/ui/card';
import { InvoiceCalculations } from '../utils/invoice-calculator';

interface Props {
  calculations: InvoiceCalculations;
  currency: string;
}

export function InvoiceSummary({ calculations, currency }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <Card className="bg-muted/30 shadow-none border-dashed">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">{formatCurrency(calculations.subtotal)}</span>
          </div>
          
          {calculations.totalDiscount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium text-destructive">-{formatCurrency(calculations.totalDiscount)}</span>
            </div>
          )}

          {calculations.totalTax > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium text-foreground">{formatCurrency(calculations.totalTax)}</span>
            </div>
          )}

          <div className="pt-4 border-t flex justify-between items-center">
            <span className="text-base font-semibold text-foreground">Grand Total</span>
            <span className="text-2xl font-extrabold text-primary tracking-tight">
              {formatCurrency(calculations.grandTotal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
