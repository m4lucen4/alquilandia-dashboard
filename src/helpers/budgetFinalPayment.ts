import type { Budget } from "@/types/budgets";

const FINAL_PAYMENT_ELIGIBLE_STATUSES = new Set(["PAID25", "TRANSFER_PAID"]);
const ADMINISTRATIVE_ROLES = new Set(["ADMIN", "TECHNICIAN"]);

export const canValidateBudget = (
  status: string,
  role: string | undefined,
  hideButtons = false,
): boolean =>
  !hideButtons &&
  FINAL_PAYMENT_ELIGIBLE_STATUSES.has(status) &&
  ADMINISTRATIVE_ROLES.has(role ?? "");

export const canCopyFinalPaymentLink = (
  status: string,
  role: string | undefined,
  hideButtons = false,
): boolean =>
  !hideButtons && status === "PAID25" && ADMINISTRATIVE_ROLES.has(role ?? "");

export const getFinalPaymentUrl = (budgetId: string): string =>
  `${window.location.origin}/reserva/${budgetId}/pago-final`;

export const isFinalPaymentEligible = (status: string): boolean =>
  FINAL_PAYMENT_ELIGIBLE_STATUSES.has(status);

export const calculateFinalPaymentAmount = (budget: Budget): number => {
  const price = budget.price;
  const discount = Math.max(
    budget.totalCouponDiscount || 0,
    price.userDiscount || 0,
  );
  const baseAmount = price.subTotalWithExtras + price.costSend - discount;
  const baseAmountInCents = Math.round(baseAmount * 100);
  const vatAmountInCents = price.withIVA
    ? Math.round(baseAmountInCents * 0.21)
    : 0;
  const finalAmountInCents =
    Math.round(baseAmountInCents * 0.75) + vatAmountInCents;

  return Math.max(0, finalAmountInCents / 100);
};
