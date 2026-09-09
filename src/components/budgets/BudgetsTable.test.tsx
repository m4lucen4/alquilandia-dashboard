import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BudgetsTable } from "./BudgetsTable";
import type { Budget, User } from "../../types/budgets";

const baseUser: User = {
  id: "user-123",
  address: "",
  blocked: false,
  discount: 0,
  dnif: "",
  email: "",
  emailHash: "",
  estado: "",
  firstName: "Grace",
  lastName: "Hopper",
  locality: "",
  password: "",
  phone: "",
  phone2: "",
  population: "",
  registered: "",
  role: "",
  zipCode: "",
  FullName: "Grace Hopper",
  googleId: "",
  appleId: "",
  company: null,
  isDeleted: false,
  deletedAt: "",
  problematic: false,
};

const baseBudget: Budget = {
  id: "budget-123",
  budgetId: "budget-123",
  budgetReference: 123,
  cancelled: false,
  comments: "",
  commentsalquilandia: "",
  concepto: "",
  creationDate: "2026-09-09",
  deletedAt: null,
  distance: "",
  client: "Ada Lovelace",
  phone: "600000000",
  address: "",
  eventDate: "2026-09-09",
  finished: false,
  isDelayed: false,
  lastUpdatedDate: "2026-09-09",
  locality: "",
  location: { latitude: "", longitude: "" },
  nosend: false,
  payment: { type: "", hpp: { AMOUNT: "", ORDER_ID: "", MERCHANT_ID: "", TIMESTAMP: "" } },
  status: "DRAFT",
  price: {
    costSend: 0,
    subTotalWithExtras: 0,
    userDiscountPercentage: 0,
    userDiscount: 0,
    extras: 0,
    total: 0,
    vat: 0,
    packs: 0,
    subTotal: 0,
    withIVA: false,
    alreadyPaid: 0,
  },
  technicianEmailHash: "",
  userEmailHash: "",
  user: baseUser,
  technician: baseUser,
  nReceipt: 0,
  receiptDate: "",
  afiliatedPhone: "",
  budgetLines: [],
  totalCouponDiscount: 0,
};

const renderBudgetsTable = (budget: Budget) => {
  render(
    <BudgetsTable
      budgets={[budget]}
      total={1}
      pageIndex={0}
      pageSize={10}
      isLoading={false}
      loadingInvoice={false}
      loadingBudget={false}
      budgetHasInvoice={() => false}
      onPageChange={vi.fn()}
      onPageSizeChange={vi.fn()}
      onGenerateInvoice={vi.fn()}
      onViewInvoice={vi.fn()}
      onViewBudget={vi.fn()}
      onGenerateBudgetPdf={vi.fn()}
      onGenerateBreakageInvoice={vi.fn()}
    />,
  );
};

describe("BudgetsTable", () => {
  it("shows the client phone after the client name", () => {
    renderBudgetsTable(baseBudget);

    expect(screen.getByText("Ada Lovelace (600000000)")).toBeVisible();
  });

  it("does not show an empty phone and preserves the no-client fallback", () => {
    renderBudgetsTable({
      ...baseBudget,
      client: "",
      phone: "   ",
      user: { ...baseUser, FullName: "" },
    });

    expect(screen.getByText("-")).toBeVisible();
    expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
  });
});
