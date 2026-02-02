/**
 * Formats an invoice number with year prefix
 * @param invoiceNumber - The invoice number
 * @param createdAt - The creation date of the invoice
 * @returns Formatted invoice number as "YYYY/XXXX"
 */
export const formatInvoiceNumber = (
  invoiceNumber: number,
  createdAt?: string,
): string => {
  const year = createdAt
    ? new Date(createdAt).getFullYear()
    : new Date().getFullYear();

  // Pad invoice number with leading zeros to 4 digits
  const paddedNumber = invoiceNumber.toString().padStart(4, "0");

  return `${year}/${paddedNumber}`;
};
