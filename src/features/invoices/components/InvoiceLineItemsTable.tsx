import { InvoiceLineItemRow } from '../types';

interface Props {
  items: InvoiceLineItemRow[];
  currency: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function LineItemCard({ item, currency }: { item: InvoiceLineItemRow; currency: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm leading-tight">{item.description}</p>
          {item.service_id && (
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">Service linked</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-foreground">{formatCurrency(Number(item.total), currency)}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs border-t pt-3">
        <div>
          <p className="text-muted-foreground">Qty</p>
          <p className="font-medium text-foreground">{item.quantity}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Unit Price</p>
          <p className="font-medium text-foreground">{formatCurrency(Number(item.unit_price), currency)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Tax</p>
          <p className="font-medium text-foreground">{Number(item.tax_rate)}%</p>
        </div>
        {Number(item.discount) > 0 && (
          <div>
            <p className="text-muted-foreground">Discount</p>
            <p className="font-medium text-emerald-600">-{formatCurrency(Number(item.discount), currency)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function InvoiceLineItemsTable({ items, currency }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center" role="tabpanel" id="tabpanel-line-items">
        <p className="text-4xl mb-3">📦</p>
        <p className="text-sm text-muted-foreground">No line items found for this invoice.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="tabpanel" id="tabpanel-line-items">
      {/* Mobile: Cards */}
      <div className="space-y-3 sm:hidden">
        {items.map((item) => (
          <LineItemCard key={item.id} item={item} currency={currency} />
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden sm:block rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm" aria-label="Invoice line items">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                Description
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide w-20">
                Qty
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide w-28">
                Unit Price
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide w-24">
                Discount
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide w-20">
                Tax %
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide w-28">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.id}
                className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${
                  idx % 2 === 0 ? '' : 'bg-muted/10'
                }`}
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{item.description}</p>
                    {item.service_id && (
                      <p className="text-xs text-muted-foreground mt-0.5">Service linked</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {formatCurrency(Number(item.unit_price), currency)}
                </td>
                <td className="px-4 py-3 text-right">
                  {Number(item.discount) > 0 ? (
                    <span className="text-emerald-600">
                      -{formatCurrency(Number(item.discount), currency)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {Number(item.tax_rate) > 0 ? `${Number(item.tax_rate)}%` : '—'}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">
                  {formatCurrency(Number(item.total), currency)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/20">
              <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                Total ({items.length} item{items.length !== 1 ? 's' : ''})
              </td>
              <td className="px-4 py-3 text-right font-bold text-foreground">
                {formatCurrency(
                  items.reduce((sum, item) => sum + Number(item.total), 0),
                  currency
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
