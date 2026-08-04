'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TopCustomerRow, PaymentMethodBreakdown } from '../types';

interface Props {
  topCustomers: TopCustomerRow[];
  paymentBreakdown: PaymentMethodBreakdown[];
  currency: string;
}

export function TopCustomersAndPaymentMethods({ topCustomers, paymentBreakdown, currency }: Props) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(val);
  };

  const getMethodEmoji = (method: string) => {
    switch (method.toUpperCase()) {
      case 'CASH':
        return '💵';
      case 'CARD':
        return '💳';
      case 'BANK_TRANSFER':
        return '🏛️';
      case 'MOBILE_BANKING':
        return '📱';
      case 'CHEQUE':
        return '🎫';
      default:
        return '📝';
    }
  };

  return (
    <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
      {/* Top 10 Customers Table */}
      <Card className="xl:col-span-2 bg-card text-card-foreground border">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">Top Customers by Revenue</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {topCustomers.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground py-8">No customer billing transactions in this period.</div>
          ) : (
            <Table className="min-w-[600px] sm:min-w-0">
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Customer</TableHead>
                  <TableHead className="text-muted-foreground">Invoices</TableHead>
                  <TableHead className="text-muted-foreground">Avg Invoice</TableHead>
                  <TableHead className="text-muted-foreground">Outstanding</TableHead>
                  <TableHead className="text-right text-muted-foreground">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map((cust) => (
                  <TableRow key={cust.customerId} className="border-border hover:bg-muted/50">
                    <TableCell className="font-semibold text-foreground">
                      <div>{cust.customerName}</div>
                      {cust.lastPaymentDate && (
                        <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                          Last Pay: {new Date(cust.lastPaymentDate).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground">{cust.invoiceCount}</TableCell>
                    <TableCell className="text-foreground">{formatCurrency(cust.averageInvoice)}</TableCell>
                    <TableCell className={cust.outstanding > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                      {formatCurrency(cust.outstanding)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(cust.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Analytics Table */}
      <Card className="bg-card text-card-foreground border">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">Payment Method Analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {paymentBreakdown.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground py-8">No payments recorded.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Method</TableHead>
                  <TableHead className="text-muted-foreground text-center">Txns</TableHead>
                  <TableHead className="text-right text-muted-foreground">Total Collected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentBreakdown
                  .sort((a, b) => b.amount - a.amount)
                  .map((item) => (
                    <TableRow key={item.method} className="border-border hover:bg-muted/50">
                      <TableCell className="font-semibold text-foreground capitalize">
                        <span className="mr-1.5">{getMethodEmoji(item.method)}</span>
                        {item.method.toLowerCase().replace('_', ' ')}
                      </TableCell>
                      <TableCell className="text-center text-foreground">{item.count}</TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-foreground">{formatCurrency(item.amount)}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400">{item.percentage.toFixed(0)}% of total</div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
