import type { Budget, BudgetLine, Price } from "../types/budgets";

const round = (n: number) => Math.round(n * 100) / 100;

export function getClientDataFromBudget(
  budget: Budget,
  invoiceTo: "titular" | "empresa",
) {
  if (invoiceTo === "empresa" && budget.user?.company) {
    return {
      client_name: budget.user.company.name,
      client_nif: budget.user.company.nif,
      client_email: budget.user?.email || "",
      client_address: budget.user.company.address,
      client_locality: budget.user.company.locality,
      client_postal_code: budget.user.company.zipCode,
      client_phone: budget.user?.phone || budget.phone || "",
    };
  }

  return {
    client_name:
      budget.user?.FullName ||
      `${budget.user?.firstName || ""} ${budget.user?.lastName || ""}`.trim() ||
      budget.client ||
      "",
    client_nif: budget.user?.dnif || "",
    client_email: budget.user?.email || "",
    client_address: budget.user?.address || budget.address || "",
    client_locality: budget.user?.locality || budget.locality || "",
    client_postal_code: budget.user?.zipCode || "",
    client_phone: budget.user?.phone || budget.phone || "",
  };
}

export function calculateAdjustedPrice(
  originalPrice: Price,
  factor: number,
  taxRate: number,
): Price {
  const adjSubTotal = round(originalPrice.subTotal * factor);
  const adjExtras = round(originalPrice.extras * factor);
  const adjCostSend = round(originalPrice.costSend * factor);
  const adjUserDiscount = round(originalPrice.userDiscount * factor);
  const vatBase = adjSubTotal + adjExtras + adjCostSend - adjUserDiscount;
  const adjVat = round(vatBase * (taxRate / 100));

  return {
    ...originalPrice,
    subTotal: adjSubTotal,
    extras: adjExtras,
    subTotalWithExtras: round(originalPrice.subTotalWithExtras * factor),
    costSend: adjCostSend,
    userDiscount: adjUserDiscount,
    packs: round(originalPrice.packs * factor),
    vat: adjVat,
    total: round(vatBase + adjVat),
  };
}

export function adjustBudgetLines(
  lines: BudgetLine[],
  factor: number,
): BudgetLine[] {
  return lines.map((line) => ({
    ...line,
    precioUd: round(line.precioUd * factor),
    totalPrice: round(line.totalPrice * factor),
    costetotal: round(line.costetotal * factor),
  }));
}

/** Recalcula el total del presupuesto ignorando los valores precalculados de la API.
 *  base  = subTotal + extras + costSend - totalCouponDiscount
 *  IVA   = base × 0.21
 *  total = base + IVA
 */
export function calculateBudgetTotal(budget: Budget): {
  base: number;
  iva: number;
  total: number;
} {
  const subTotal = budget.price?.subTotal || 0;
  const extras = budget.price?.extras || 0;
  const costSend = budget.price?.costSend || 0;
  const couponDiscount = budget.totalCouponDiscount || 0;
  const base = round(subTotal + extras + costSend - couponDiscount);
  const iva = round(base * 0.21);
  return { base, iva, total: round(base + iva) };
}

/**
 * Formats a date string (YYYY-MM-DD) to a readable format (DD/MM/YYYY)
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};
