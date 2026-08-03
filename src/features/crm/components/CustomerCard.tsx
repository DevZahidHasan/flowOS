'use client';

import { Customer } from '../types';
import { Badge } from '@/components/ui/badge';

interface Props {
  customer: Customer;
  onSelect: (customer: Customer) => void;
}

export function CustomerCard({ customer, onSelect }: Props) {
  return (
    <div
      onClick={() => onSelect(customer)}
      className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-5 shadow-xl transition-all hover:border-purple-500/40 cursor-pointer active:scale-[0.99] flex flex-col justify-between space-y-4"
    >
      {/* Top Profile Header */}
      <div className="flex items-center space-x-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 font-bold text-white shadow-md text-base">
          {customer.fullName.substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-white text-base tracking-tight truncate">{customer.fullName}</h3>
          <p className="text-xs text-slate-400 truncate">{customer.phone || customer.email || 'No contact provided'}</p>
        </div>
        <Badge variant="default" className="text-xs">
          ⭐ {customer.loyaltyPoints} pts
        </Badge>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 text-center text-xs">
        <div>
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Visits</span>
          <span className="font-bold text-white">{customer.totalVisits}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Spent</span>
          <span className="font-bold text-purple-300">${customer.lifetimeSpending.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Balance</span>
          <span className={`font-bold ${customer.outstandingBalance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
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
              className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
