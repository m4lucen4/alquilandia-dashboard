import { describe, expect, it } from "vitest";
import {
  calculateFinalPaymentAmount,
  canCopyFinalPaymentLink,
  canValidateBudget,
  getFinalPaymentUrl,
  isFinalPaymentEligible,
} from "@/helpers/budgetFinalPayment";
import type { Budget } from "@/types/budgets";

const budget = {
  totalCouponDiscount: 10,
  price: {
    subTotalWithExtras: 100,
    costSend: 20,
    userDiscount: 5,
    withIVA: true,
    alreadyPaid: 0,
  },
} as Budget;

describe("final budget payment", () => {
  it("shows legacy actions only for administrative users and eligible statuses", () => {
    expect(canValidateBudget("PAID25", "ADMIN")).toBe(true);
    expect(canValidateBudget("TRANSFER_PAID", "TECHNICIAN")).toBe(true);
    expect(canValidateBudget("PAID25", "CLIENT")).toBe(false);
    expect(canValidateBudget("PAID25", "ADMIN", true)).toBe(false);
    expect(canCopyFinalPaymentLink("PAID25", "ADMIN")).toBe(true);
    expect(canCopyFinalPaymentLink("TRANSFER_PAID", "ADMIN")).toBe(false);
  });

  it("calculates 75% of the base amount plus the full VAT", () => {
    expect(calculateFinalPaymentAmount(budget)).toBe(105.6);
  });

  it("calculates 75% of the base amount when VAT is disabled", () => {
    expect(
      calculateFinalPaymentAmount({
        ...budget,
        price: { ...budget.price, withIVA: false },
      }),
    ).toBe(82.5);
  });

  it("accepts only statuses eligible for the public final payment route", () => {
    expect(isFinalPaymentEligible("PAID25")).toBe(true);
    expect(isFinalPaymentEligible("TRANSFER_PAID")).toBe(true);
    expect(isFinalPaymentEligible("PAID")).toBe(false);
  });

  it("builds the public final payment link used by the copy handler", () => {
    expect(getFinalPaymentUrl("budget-123")).toBe(
      `${window.location.origin}/reserva/budget-123/pago-final`,
    );
  });
});
