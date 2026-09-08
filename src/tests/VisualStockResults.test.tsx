import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VisualStockResults } from "@/components/visualStock/VisualStockResults";
import type { Budget, BudgetLine } from "@/types/budgets";

const budget = {
  id: "budget-1",
  budgetReference: 45,
  address: "",
  eventDate: "2026-05-20",
  budgetLines: [{ id: "line-1", units: 2, packId: "", objetoid: "" }],
} as Budget;

const createProducts = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `product-${index + 1}`,
    name: `Product ${index + 1}`,
    units: index + 1,
    unidades: 100 + index,
    products: [] as BudgetLine[],
    budgets: [],
  }));

const createExtras = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `extra-${index + 1}`,
    extraName: `Extra ${index + 1}`,
    units: index + 1,
    budgets: [],
  }));

describe("VisualStockResults", () => {
  it("shows the initial prompt before searching", () => {
    render(
      <VisualStockResults
        tab="products"
        products={[]}
        extras={[]}
        isLoading={false}
        hasSearched={false}
        onViewBudget={vi.fn()}
      />,
    );

    expect(screen.getByText("Introduzca un rango de fecha.")).toBeInTheDocument();
  });

  it("expands product budgets, falls back to warehouse pickup and opens detail", async () => {
    const user = userEvent.setup();
    const onViewBudget = vi.fn();

    render(
      <VisualStockResults
        tab="products"
        products={[
          {
            id: "product-1",
            name: "Chair",
            units: 2,
            unidades: 10,
            products: [] as BudgetLine[],
            budgets: [budget],
          },
        ]}
        extras={[]}
        isLoading={false}
        hasSearched
        onViewBudget={onViewBudget}
      />,
    );

    await user.click(screen.getByText("Chair"));

    expect(screen.getByText("Recogida en almacén")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ver detalle" }));
    expect(onViewBudget).toHaveBeenCalledWith(budget);
  });

  it("renders units from a normalized legacy budget line", async () => {
    const user = userEvent.setup();
    const legacyBudget = budget;

    render(
      <VisualStockResults
        tab="products"
        products={[{
          id: "product-1",
          name: "Chair",
          units: 2,
          unidades: 10,
          products: [],
          budgets: [legacyBudget],
        }]}
        extras={[]}
        isLoading={false}
        hasSearched
        onViewBudget={vi.fn()}
      />,
    );

    await user.click(screen.getByText("Chair"));

    expect(within(screen.getByText("45").closest("tr")!).getByText("2")).toBeInTheDocument();
  });

  it("shows the empty state and does not render pagination without grouped results", () => {
    render(
      <VisualStockResults
        tab="products"
        products={[]}
        extras={[]}
        isLoading={false}
        hasSearched
        onViewBudget={vi.fn()}
      />,
    );

    expect(screen.getByText("No hay resultados para el rango de fechas seleccionado.")).toBeInTheDocument();
    expect(screen.queryByLabelText("Pagination")).not.toBeInTheDocument();
  });

  it("keeps exactly twenty grouped products on a page with matching product column tracks", () => {
    const { container } = render(
      <VisualStockResults
        tab="products"
        products={createProducts(20)}
        extras={[]}
        isLoading={false}
        hasSearched
        onViewBudget={vi.fn()}
      />,
    );

    expect(container.querySelectorAll("details")).toHaveLength(20);
    expect(screen.queryByLabelText("Pagination")).not.toBeInTheDocument();
    expect(screen.getByText("Uds. inventario")).toBeInTheDocument();
    const productTracks = "grid-cols-[minmax(12rem,1fr)_7rem_8rem]";
    expect(screen.getByText("Uds. inventario").parentElement).toHaveClass(productTracks);
    expect(screen.getByText("Product 1").closest("summary")).toHaveClass(productTracks);
  });

  it("navigates bounded twenty-item pages and resets when results or tabs change", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(
      <VisualStockResults
        tab="products"
        products={createProducts(21)}
        extras={createExtras(21)}
        isLoading={false}
        hasSearched
        onViewBudget={vi.fn()}
      />,
    );

    const nextButton = screen.getAllByRole("button", { name: "Siguiente" }).find((button) => !button.hasAttribute("disabled"));
    expect(nextButton).toBeDefined();
    await user.click(nextButton!);
    expect(screen.getByText("Product 21")).toBeInTheDocument();
    expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
    screen.getAllByRole("button", { name: "Siguiente" }).forEach((button) => {
      expect(button).toBeDisabled();
    });

    rerender(
      <VisualStockResults
        tab="products"
        products={createProducts(21)}
        extras={createExtras(21)}
        isLoading={false}
        hasSearched
        onViewBudget={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText("Product 1")).toBeInTheDocument());
    expect(screen.queryByText("Product 21")).not.toBeInTheDocument();

    rerender(
      <VisualStockResults
        tab="extras"
        products={createProducts(20)}
        extras={createExtras(21)}
        isLoading={false}
        hasSearched
        onViewBudget={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText("Extra 1")).toBeInTheDocument());
    expect(container.querySelectorAll("details")).toHaveLength(20);
    expect(screen.queryByText("Uds. inventario")).not.toBeInTheDocument();
    expect(screen.getByText("Extra 1").closest("summary")).toHaveClass("grid-cols-[minmax(12rem,1fr)_7rem]");
  });
});
