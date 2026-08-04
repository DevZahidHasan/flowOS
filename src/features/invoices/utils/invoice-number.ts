/**
 * Generates an invoice number based on a workspace prefix and the next sequence number.
 * Ensures numbers are zero-padded.
 * 
 * Future expansion: The prefix and padding length could be configured per workspace in a settings table.
 */
export function generateInvoiceNumber(
  prefix: string,
  sequenceNumber: number,
  padding: number = 6
): string {
  const paddedNumber = sequenceNumber.toString().padStart(padding, '0');
  
  // Clean the prefix: uppercase, strip spaces and special chars
  const cleanPrefix = prefix
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 5); // Keep it short

  // If prefix is completely stripped, default to current year
  const finalPrefix = cleanPrefix || new Date().getFullYear().toString();

  return `${finalPrefix}-${paddedNumber}`;
}
