import type { Budget, BudgetLine, Coupon, Extra, PriceException } from "@/types/budgets";
import type { Inventory } from "@/types/inventory";
import type { ShippingCost } from "@/types/shippingCosts";
import { VAT_FACTOR } from "@/constants";

// Compara dos fechas por día local (sin zona horaria), equivalente a moment().startOf("day").isSame()
function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getExceptionPrice(
  product: { precioUd: number; priceExceptionList?: Array<{ date: string; price: number }> },
  eventDate: string,
): number {
  if (!eventDate || eventDate.startsWith("0001-")) return product.precioUd;
  const eventDay = new Date(eventDate);
  const exception = product.priceExceptionList?.find((e) =>
    isSameLocalDay(new Date(e.date), eventDay),
  );
  return exception ? exception.price : product.precioUd;
}

export function buildBudgetLine(
  product: Inventory,
  units: number,
  descuento: number,
  extras: Extra[],
  unitPrice: number,
): BudgetLine {
  const totalPrice = units * unitPrice - (units * unitPrice * descuento) / 100;

  return {
    id: product.id,
    elemento: product.elemento,
    unidades: product.unidades,
    observaciones: product.observaciones ?? "",
    codigo: null,
    nombre: null,
    categoria: product.categoria,
    precioUd: unitPrice,
    preciocoste: product.precioCoste,
    costetotal: product.costeTotal,
    bloqueo: product.bloqueo,
    objetoid: product.objetoid ?? "",
    private: product.private,
    priceExceptionList: (product.priceExceptionList ?? []).map(
      (e): PriceException => ({ id: e.id ?? "", price: e.price, date: e.date }),
    ),
    extras,
    archivo: (product.archivo ?? []).map((img) => ({
      id: img.id,
      fileName: img.fileName,
      fileId: img.fileId,
      fileUri: img.fileUri,
    })),
    datetime: product.datetime ?? "",
    originalPrice: product.precioUd,
    units,
    descuento,
    extra: "",
    totalPrice,
  };
}

// Calcula el coste de envío según las tarifas y los bloqueos de las líneas.
// Paridad con calculateAndGetCostSend del legacy.
export function calculateCostSend(
  budget: Budget,
  shippingCosts: ShippingCost | null,
): number {
  if (budget.nosend || !shippingCosts) return 0;
  const lines = budget.budgetLines ?? [];
  if (lines.length === 0) return 0;

  const distanceStr = budget.distance ?? "";
  const distance = Number(distanceStr.split(" ")[0].replace(",", ".")) || 0;

  const blockValues = lines.map((l) => l.bloqueo ?? 0);
  const maxBlock = Math.max(...blockValues);
  const hasZeroBlocks = blockValues.includes(0);
  const hasNonZeroBlocks = blockValues.some((b) => b > 0);
  const hasMultipleBlocks = hasZeroBlocks && hasNonZeroBlocks;

  const {
    fixedPriceBlockZero,
    fixedPriceBlockNotZero,
    distanceVarBlockZero,
    distanceVarBlockNotZero,
  } = shippingCosts;

  if (hasMultipleBlocks) {
    return (
      distance * (distanceVarBlockZero + distanceVarBlockNotZero) +
      (fixedPriceBlockZero + fixedPriceBlockNotZero)
    );
  }

  if (maxBlock === 0) {
    return distance * distanceVarBlockZero + fixedPriceBlockZero;
  }

  return distance * distanceVarBlockNotZero + fixedPriceBlockNotZero;
}

// Recalcula el descuento por cupón en cada línea (sin packId).
// Paridad con recalculateBudgetCouponDiscount del legacy.
export function recalculateCouponDiscount(
  lines: BudgetLine[],
  coupon: Coupon,
): { lines: BudgetLine[]; totalCouponDiscount: number } {
  let totalCouponDiscount = 0;
  const updatedLines = lines.map((line) => {
    if (line.packId) return line;
    const lineDiscount = line.precioUd * line.units * (coupon.discount / 100);
    totalCouponDiscount += lineDiscount;
    return { ...line, couponDiscount: lineDiscount };
  });
  return { lines: updatedLines, totalCouponDiscount };
}

// Devuelve el descuento aplicado (cupón o usuario, el mayor por porcentaje, nunca ambos).
// Paridad con getActualBudget del legacy.
export function getAppliedDiscount(budget: Budget): number {
  const couponPct = budget.coupon?.discount ?? 0;
  const userDiscountPct = budget.price?.userDiscountPercentage ?? 0;
  const couponTotal = budget.totalCouponDiscount ?? 0;
  const userDiscount = budget.price?.userDiscount ?? 0;

  if (budget.coupon && userDiscountPct < couponPct) {
    return couponTotal;
  }
  return userDiscount;
}

// Recálculo canónico de price. Acepta shippingCosts opcional:
//   - undefined → conserva prevPrice.costSend (compatible con step 3 que no tiene shippingCosts)
//   - null | ShippingCost → calcula costSend fresco (step 4)
export function recalculatePrice(
  budget: Budget,
  shippingCosts?: ShippingCost | null,
): Budget {
  const lines = budget.budgetLines ?? [];

  const subTotal = lines.reduce((acc, l) => acc + l.totalPrice, 0);
  const extras = lines.reduce(
    (acc, l) =>
      acc +
      (l.extras ?? []).reduce(
        (eAcc, e) => eAcc + (e.checked ? e.price * e.units : 0),
        0,
      ),
    0,
  );
  const subTotalWithExtras = subTotal + extras;

  const prevPrice = budget.price ?? ({} as Budget["price"]);
  const packs = prevPrice.packs ?? 0;

  let userDiscountPercentage = prevPrice.userDiscountPercentage ?? 0;
  let userDiscount = prevPrice.userDiscount ?? 0;
  if (budget.user?.discount) {
    userDiscountPercentage = budget.user.discount;
    userDiscount = (subTotal - packs) * (budget.user.discount / 100);
  }

  // costSend: si se pasa shippingCosts (incluso null), recalcula; si no, conserva el previo
  let costSend: number;
  if (shippingCosts === undefined) {
    costSend = prevPrice.costSend ?? 0;
  } else {
    costSend = calculateCostSend(budget, shippingCosts);
  }

  // cupón: recalcula couponDiscount por línea si hay cupón activo
  let updatedLines = lines;
  let totalCouponDiscount = budget.totalCouponDiscount ?? 0;
  if (budget.coupon) {
    const result = recalculateCouponDiscount(lines, budget.coupon);
    updatedLines = result.lines;
    totalCouponDiscount = result.totalCouponDiscount;
  }

  // descuento aplicado: el mayor entre cupón y usuario (por porcentaje), nunca ambos
  const couponPct = budget.coupon?.discount ?? 0;
  const applied =
    budget.coupon && userDiscountPercentage < couponPct
      ? totalCouponDiscount
      : userDiscount;

  const totalPriceWithoutVat = subTotalWithExtras + costSend - applied;
  const vat = totalPriceWithoutVat * VAT_FACTOR;
  const withIVA = prevPrice.withIVA ?? false;
  const total = withIVA ? totalPriceWithoutVat + vat : totalPriceWithoutVat;

  return {
    ...budget,
    budgetLines: updatedLines,
    totalCouponDiscount,
    price: {
      ...prevPrice,
      subTotal,
      extras,
      subTotalWithExtras,
      userDiscountPercentage,
      userDiscount,
      packs,
      costSend,
      vat,
      total,
    },
  };
}

export function upsertBudgetLine(
  budget: Budget,
  product: Inventory,
  opts: { unitsToAdd: number; descuento: number; extras: Extra[] },
  shippingCosts?: ShippingCost | null,
): Budget {
  const unitPrice = getExceptionPrice(product, budget.eventDate);
  const lines = [...(budget.budgetLines ?? [])];
  const existingIndex = lines.findIndex((l) => l.id === product.id);

  let finalUnits = opts.unitsToAdd;
  let finalExtras = opts.extras;

  if (existingIndex >= 0) {
    const existing = lines[existingIndex];
    finalUnits = existing.units + opts.unitsToAdd;
    // merge OR: si un extra ya estaba checked, sigue checked aunque el usuario lo desmarcara
    finalExtras = opts.extras.map((e) => {
      const prev = existing.extras?.find((pe) => pe.extraName === e.extraName);
      return { ...e, checked: e.checked || (prev?.checked ?? false) };
    });
  }

  const newLine = buildBudgetLine(product, finalUnits, opts.descuento, finalExtras, unitPrice);

  if (existingIndex >= 0) {
    lines[existingIndex] = newLine;
  } else {
    lines.push(newLine);
  }

  return recalculatePrice({ ...budget, budgetLines: lines }, shippingCosts);
}

export function removeBudgetLine(
  budget: Budget,
  lineId: string,
  shippingCosts?: ShippingCost | null,
): Budget {
  const lines = (budget.budgetLines ?? []).filter((l) => l.id !== lineId);
  return recalculatePrice({ ...budget, budgetLines: lines }, shippingCosts);
}

export function setBudgetLineUnits(
  budget: Budget,
  lineId: string,
  units: number,
  shippingCosts?: ShippingCost | null,
): Budget {
  const lines = (budget.budgetLines ?? []).map((l) => {
    if (l.id !== lineId) return l;
    const unitPrice = getExceptionPrice(
      { precioUd: l.originalPrice, priceExceptionList: l.priceExceptionList },
      budget.eventDate,
    );
    const totalPrice = units * unitPrice - (units * unitPrice * l.descuento) / 100;
    return { ...l, units, totalPrice };
  });
  return recalculatePrice({ ...budget, budgetLines: lines }, shippingCosts);
}

// Mutación general de línea (unidades, descuento, extras) para el step 4.
export function updateBudgetLineValues(
  budget: Budget,
  lineId: string,
  patch: { units?: number; descuento?: number; extras?: Extra[] },
  shippingCosts?: ShippingCost | null,
): Budget {
  const lines = (budget.budgetLines ?? []).map((l) => {
    if (l.id !== lineId) return l;
    const units = patch.units ?? l.units;
    const descuento = patch.descuento ?? l.descuento;
    const extras = patch.extras ?? l.extras;
    const unitPrice = getExceptionPrice(
      { precioUd: l.originalPrice, priceExceptionList: l.priceExceptionList },
      budget.eventDate,
    );
    const totalPrice = units * unitPrice - (units * unitPrice * descuento) / 100;
    return { ...l, units, descuento, extras, totalPrice };
  });
  return recalculatePrice({ ...budget, budgetLines: lines }, shippingCosts);
}
