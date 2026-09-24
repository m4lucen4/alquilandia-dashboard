import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModalBudgetHistory } from "./ModalBudgetHistory";
import type { BudgetHistoryEntry, HistoricBudgetSnapshot } from "@/types/budgets";

const createSnapshot = (reference: number): HistoricBudgetSnapshot => ({
  id: `budget-${reference}`,
  budgetReference: reference,
  status: "PAID",
  creationDate: "2026-01-10T10:00:00.000Z",
  eventDate: "2026-02-10T10:00:00.000Z",
  address: "Calle Histórica 10",
  client: "Ada Lovelace",
  budgetLines: [{ id: "line-1", nombre: "Silla", elemento: "", units: 2, unidades: 2, totalPrice: 30 }] as HistoricBudgetSnapshot["budgetLines"],
  price: { subTotal: 30, subTotalWithExtras: 40, extras: 10, costSend: 5, userDiscount: 3, withIVA: true },
} as HistoricBudgetSnapshot);

const entries: BudgetHistoryEntry[] = [
  { historyDate: "2026-01-01T10:00:00.000Z", eventType: "BUDGET_CREATED", budget: createSnapshot(1) },
  {
    historyDate: "2026-02-01T10:00:00.000Z",
    eventType: "RECEIPT_100_CREATED",
    budget: { ...createSnapshot(2), receipts: [{ id: "historic-receipt", type: "Factura100", nfacture: 7, creationDate: "2026-02-01" }] },
  },
];

describe("ModalBudgetHistory", () => {
  it("sorts entries newest first without mutating the supplied history", () => {
    render(<ModalBudgetHistory isOpen onClose={() => undefined} entries={entries} />);

    expect(screen.getAllByRole("button", { name: /Creado|Factura 100%/ }).map((button) => button.textContent)).toEqual([
      expect.stringContaining("Factura 100%"),
      expect.stringContaining("Creado"),
    ]);
    expect(entries[0].eventType).toBe("BUDGET_CREATED");
  });

  it("shows only the selected entry snapshot and its supplied historic receipts", async () => {
    const user = userEvent.setup();
    render(<ModalBudgetHistory isOpen onClose={() => undefined} entries={entries} />);

    await user.click(screen.getByRole("button", { name: /Factura 100%/ }));

    expect(screen.getByText("Calle Histórica 10")).toBeVisible();
    expect(screen.getByLabelText("Facturas históricas")).toHaveTextContent("Factura final Nº: 7");
  });

  it("preserves historical customer, technician, discount, and amount fields", async () => {
    const user = userEvent.setup();
    const historicalEntry: BudgetHistoryEntry = {
      historyDate: "2026-02-01T10:00:00.000Z",
      eventType: "STATUS_CHANGE",
      budget: {
        ...createSnapshot(3),
        client: "",
        user: { name: "Cliente histórico", discount: 10 },
        technician: { firstName: "Grace", lastName: "Hopper" },
        coupon: { discount: 5 },
        totalCouponDiscount: 5,
      } as HistoricBudgetSnapshot,
    };
    render(<ModalBudgetHistory isOpen onClose={() => undefined} entries={[historicalEntry]} />);

    await user.click(screen.getByRole("button", { name: /Cambio de estado/ }));

    expect(screen.getByText("Cliente histórico")).toBeVisible();
    expect(screen.getByText("Grace Hopper")).toBeVisible();
    expect(screen.getByText("Subtotal con descuento").parentElement).toHaveTextContent("35,00 €");
    expect(screen.getByText("Extras").parentElement).toHaveTextContent("10,00 €");
    expect(screen.getByText(/Cupón descuento/).parentElement).toHaveTextContent("-5,00 €");
    expect(screen.getByText("Gastos del envío").parentElement).toHaveTextContent("5,00 €");
    expect(screen.getByText("IVA (21%)").parentElement).toHaveTextContent("7,77 €");
    expect(screen.getAllByText("Total")[1].parentElement).toHaveTextContent("44,77 €");
  });

  it("uses unique keys for duplicate events and clears a stale selected entry after entries change", async () => {
    const user = userEvent.setup();
    const duplicateEntries = [
      ...entries,
      { ...entries[1], budget: createSnapshot(4) },
    ];
    const { rerender } = render(<ModalBudgetHistory isOpen onClose={() => undefined} entries={duplicateEntries} />);

    expect(screen.getAllByRole("button", { name: /Factura 100%/ })).toHaveLength(2);
    await user.click(screen.getAllByRole("button", { name: /Factura 100%/ })[0]);
    expect(screen.getByText("Calle Histórica 10")).toBeVisible();

    rerender(<ModalBudgetHistory isOpen onClose={() => undefined} entries={[entries[0]]} />);
    expect(screen.getByText("Selecciona una acción para ver su versión histórica.")).toBeVisible();
  });

  it("renders loading, error, and empty states from props", () => {
    const { rerender } = render(<ModalBudgetHistory isOpen onClose={() => undefined} entries={null} isLoading />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando historial...");

    rerender(<ModalBudgetHistory isOpen onClose={() => undefined} entries={null} error="No se pudo cargar el historial" />);
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo cargar el historial");

    rerender(<ModalBudgetHistory isOpen onClose={() => undefined} entries={[]} />);
    expect(screen.getByText("Sin histórico.")).toBeVisible();
  });
});
