import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModalBudgetData } from "@/components/budgets/ModalBudgetData";
import type { CurrentUser } from "@/types/auth";
import type { Budget } from "@/types/budgets";

const budget = {
  id: "budget-123",
  budgetReference: 123,
  status: "PAID25",
  budgetLines: [],
  price: {
    subTotal: 0,
    extras: 0,
    costSend: 0,
    userDiscount: 0,
  },
  totalCouponDiscount: 0,
} as unknown as Budget;

const currentUser = { role: "ADMIN" } as CurrentUser;

describe("ModalBudgetData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows contextual success feedback after copying the final payment link", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);

    render(
      <ModalBudgetData
        isOpen
        onClose={vi.fn()}
        budget={budget}
        user={null}
        currentUser={currentUser}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Link de pago final" }));

    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/reserva/budget-123/pago-final`,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Link copiado al portapapeles",
    );
  });

  it("shows contextual error feedback when copying fails", async () => {
    const user = userEvent.setup();
    vi
      .spyOn(navigator.clipboard, "writeText")
      .mockRejectedValue(new Error("Clipboard unavailable"));

    render(
      <ModalBudgetData
        isOpen
        onClose={vi.fn()}
        budget={budget}
        user={null}
        currentUser={currentUser}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Link de pago final" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "No se pudo copiar el link. Inténtalo de nuevo.",
    );
  });
});
