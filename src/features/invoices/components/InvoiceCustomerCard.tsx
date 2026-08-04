import Link from 'next/link';
import { Mail, Phone, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Customer } from '@/features/crm/types';

interface Props {
  customer: Customer;
  workspaceSlug: string;
}

export function InvoiceCustomerCard({ customer, workspaceSlug }: Props) {
  const initials = customer.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Customer</h2>

      {/* Avatar + Name */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm"
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">{customer.fullName}</p>
          <p className="text-xs text-muted-foreground">
            {customer.totalVisits} visit{customer.totalVisits !== 1 ? 's' : ''} · ${customer.lifetimeSpending.toFixed(0)} LTV
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2">
        {customer.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <a
              href={`mailto:${customer.email}`}
              className="text-muted-foreground hover:text-foreground transition-colors truncate"
            >
              {customer.email}
            </a>
          </div>
        )}
        {customer.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <a
              href={`tel:${customer.phone}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {customer.phone}
            </a>
          </div>
        )}
      </div>

      {/* Tags */}
      {customer.tags && customer.tags.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Tag className="h-3 w-3" aria-hidden="true" />
            Tags
          </div>
          <div className="flex flex-wrap gap-1">
            {customer.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Future CRM Link — architected but deferred */}
      <div className="pt-2 border-t">
        <Link
          href={`/${workspaceSlug}/customers`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all customers →
        </Link>
      </div>
    </div>
  );
}
