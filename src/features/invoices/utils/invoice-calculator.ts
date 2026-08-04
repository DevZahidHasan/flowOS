import { InvoiceLineItemInput } from '../validations/invoice.schema';

export interface InvoiceCalculations {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  items: Array<InvoiceLineItemInput & { total: number }>;
}

/**
 * Rounds a number to exactly two decimal places safely.
 */
function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates the totals for individual line items and the entire invoice.
 * Never trusts client-provided totals, always recalculates from base quantities, prices, and rates.
 */
export function calculateInvoiceTotals(items: InvoiceLineItemInput[]): InvoiceCalculations {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let grandTotal = 0;

  const calculatedItems = items.map((item) => {
    // Base amount for this item
    const baseAmount = item.quantity * item.unit_price;
    
    // The discount is a flat amount applied to the line, or we could treat it as a rate depending on business rules.
    // Assuming flat amount discount per line based on schema:
    const itemDiscount = Math.min(baseAmount, item.discount);
    
    // Amount after discount
    const discountedAmount = baseAmount - itemDiscount;

    // Tax calculation (e.g., tax_rate of 10 means 10%)
    const itemTax = (discountedAmount * (item.tax_rate / 100));

    // Line total
    const lineTotal = roundToTwo(discountedAmount + itemTax);

    // Accumulate invoice-level totals
    subtotal += baseAmount;
    totalDiscount += itemDiscount;
    totalTax += itemTax;
    grandTotal += lineTotal;

    return {
      ...item,
      total: lineTotal,
    };
  });

  return {
    subtotal: roundToTwo(subtotal),
    totalDiscount: roundToTwo(totalDiscount),
    totalTax: roundToTwo(totalTax),
    grandTotal: roundToTwo(grandTotal),
    items: calculatedItems,
  };
}
