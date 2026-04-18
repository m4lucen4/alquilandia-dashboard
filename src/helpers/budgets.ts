import type { Budget, BudgetLine, Price, User } from "../types/budgets";

const round = (n: number) => Math.round(n * 100) / 100;

export function getClientDataFromUser(
  user: User,
  invoiceTo: "titular" | "empresa",
) {
  if (invoiceTo === "empresa" && user.company) {
    return {
      client_name: user.company.name,
      client_nif: user.company.nif,
      client_email: user.email || "",
      client_address: user.company.address,
      client_locality: user.company.locality,
      client_postal_code: user.company.zipCode,
      client_phone: user.phone || "",
    };
  }

  return {
    client_name:
      user.FullName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "",
    client_nif: user.dnif || "",
    client_email: user.email || "",
    client_address: user.address || "",
    client_locality: user.locality || "",
    client_postal_code: user.zipCode || "",
    client_phone: user.phone || "",
  };
}


export function calculateAdjustedPrice(
  originalPrice: Price,
  factor: number,
  taxRate: number,
  couponDiscount: number = 0,
): Price {
  const adjSubTotal = round(originalPrice.subTotal * factor);
  const adjExtras = round(originalPrice.extras * factor);
  const adjCostSend = round(originalPrice.costSend * factor);
  const adjUserDiscount = round(originalPrice.userDiscount * factor);
  const adjCouponDiscount = round(couponDiscount * factor);
  const totalDiscount = round(adjUserDiscount + adjCouponDiscount);
  const vatBase = adjSubTotal + adjExtras + adjCostSend - totalDiscount;
  const adjVat = round(vatBase * (taxRate / 100));

  return {
    ...originalPrice,
    subTotal: adjSubTotal,
    extras: adjExtras,
    subTotalWithExtras: round(originalPrice.subTotalWithExtras * factor),
    costSend: adjCostSend,
    userDiscount: totalDiscount,
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

/**
 * Converts a UTC date string to a local YYYY-MM-DD string using browser timezone.
 * Critical for Spain (UTC+2): "2026-06-05T22:00:00Z" → "2026-06-06" in local time.
 */
export const toLocalDateString = (dateStr: string): string => {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Returns the effective unit price for a budget line, applying price exceptions by event date.
 * If the event date matches an entry in priceExceptionList, that price is used instead.
 */
export const getEffectiveUnitPrice = (
  line: { precioUd?: number; priceExceptionList?: { price: number; date: string }[] },
  eventDate?: string,
): number => {
  if (!eventDate || !line.priceExceptionList?.length) return line.precioUd || 0;
  const eventDay = toLocalDateString(eventDate);
  const exception = line.priceExceptionList.find(
    (ex) => toLocalDateString(ex.date) === eventDay,
  );
  return exception ? exception.price : line.precioUd || 0;
};
