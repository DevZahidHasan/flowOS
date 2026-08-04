'use client';

import { Customer } from '../types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Props {
  customer: Customer;
  onSelect: (customer: Customer) => void;
}

export function CustomerCard({ customer, onSelect }: Props) {
  return (
    <Card
      onClick={() => onSelect(customer)}
      className="p-5 hover:border-primary/40 cursor-pointer active:scale-[0.99] flex flex-col justify-between space-y-4 transition-all duration-200 shadow-sm hover:shadow-md bg-card text-card-foreground"
    >
      {/* Top Profile Header */}
      <div className="flex items-center space-x-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 font-bold text-white shadow-md text-base">
          {customer.fullName.substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-foreground text-base tracking-tight truncate">{customer.fullName}</h3>
          <p className="text-xs text-muted-foreground truncate">{customer.phone || customer.email || 'No contact provided'}</p>
        </div>
        <Badge variant="default" className="text-xs">
          ⭐ {customer.loyaltyPoints} pts
        </Badge>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 bg-muted/50 p-2.5 rounded-xl border text-center text-xs text-muted-foreground">
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Visits</span>
          <span className="font-bold text-foreground">{customer.totalVisits}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Spent</span>
          <span className="font-bold text-foreground">${customer.lifetimeSpending.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Balance</span>
          <span className={`font-bold ${customer.outstandingBalance > 0 ? 'text-destructive' : 'text-emerald-500 dark:text-emerald-400'}`}>
            ${customer.outstandingBalance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Tags Row */}
      {customer.tags && customer.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {customer.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
