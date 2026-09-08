import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockApiClient } = vi.hoisted(() => ({ mockApiClient: vi.fn() }));

vi.mock("@/services/api", () => ({ apiClient: mockApiClient }));

import {
  aggregateExtraBudgetRows,
  aggregateVisualStockExtras,
  aggregateVisualStockProducts,
  getProductBudgetUnits,
} from "@/helpers/visualStock";
import {
  getVisualStockExtras,
  getVisualStockProducts,
  serializeVisualStockDateTime,
} from "@/services/visualStockService";
import type { Budget, BudgetLine } from "@/types/budgets";
import type { VisualStockExtraSource, VisualStockProductSource } from "@/types/visualStock";

const budget = (id: string, reference: number, lines: BudgetLine[] = []): Budget =>
  ({ id, budgetReference: reference, budgetLines: lines, address: "", eventDate: "2026-01-01" }) as Budget;

describe("visual stock services", () => {
  beforeEach(() => mockApiClient.mockReset());

  it("keeps the legacy UTC query serialization without a Z suffix", async () => {
    const response = { json: vi.fn().mockResolvedValue([]) };
    mockApiClient.mockResolvedValue(response);

    expect(serializeVisualStockDateTime("2026-02-03T04:05:06Z")).toBe("2026-02-03T04:05:06");
    expect(serializeVisualStockDateTime("2026-09-10T22:00:00Z")).toBe("2026-09-10T22:00:00");
    await getVisualStockProducts({ startDate: "2026-02-03T04:05:06Z", endDate: "2026-02-04T04:05:06Z" });
    await getVisualStockExtras({ startDate: "2026-02-03T04:05:06Z", endDate: "2026-02-04T04:05:06Z" });

    expect(mockApiClient).toHaveBeenNthCalledWith(1, "/budgets/stock?start=2026-02-03T04:05:06&end=2026-02-04T04:05:06");
    expect(mockApiClient).toHaveBeenNthCalledWith(2, "/budgets/extras/stock?start=2026-02-03T04:05:06&end=2026-02-04T04:05:06");
  });

  it("serializes date-only selections as local midnight for both stock endpoints", async () => {
    const response = { json: vi.fn().mockResolvedValue([]) };
    mockApiClient.mockResolvedValue(response);

    await getVisualStockProducts({ startDate: "2026-09-11", endDate: "2026-09-11" });
    await getVisualStockExtras({ startDate: "2026-01-11", endDate: "2026-01-11" });

    expect(serializeVisualStockDateTime("2026-09-11")).toBe("2026-09-10T22:00:00");
    expect(serializeVisualStockDateTime("2026-01-11")).toBe("2026-01-10T23:00:00");
    expect(mockApiClient).toHaveBeenNthCalledWith(1, "/budgets/stock?start=2026-09-10T22:00:00&end=2026-09-10T22:00:00");
    expect(mockApiClient).toHaveBeenNthCalledWith(2, "/budgets/extras/stock?start=2026-01-10T23:00:00&end=2026-01-10T23:00:00");
  });

  it("normalizes legacy object budget lines for both stock endpoints", async () => {
    const productResponse = {
      json: vi.fn().mockResolvedValue([{
        id: "product-1",
        name: "Chair",
        units: "2",
        products: [{ elemento: "Chair", units: "4" }],
        budgets: [
          {
            id: "budget-1",
            budgetReference: 1,
            budgetLines: {
              id: "line-1",
              units: "2",
              packId: "pack-1",
              objetoid: "",
              extras: [{ id: "extra-1", extraName: "Assembly", units: "3" }],
            },
          },
          { id: "budget-2", budgetReference: 2, budgetLines: null },
          { id: "budget-3", budgetReference: 3 },
        ],
      }]),
    };
    const extraResponse = {
      json: vi.fn().mockResolvedValue([{
        id: "extra-1",
        extraName: "Assembly",
        units: "3",
        budget: {
          id: "budget-1",
          budgetReference: 1,
          budgetLines: null,
        },
      }]),
    };
    mockApiClient.mockResolvedValueOnce(productResponse).mockResolvedValueOnce(extraResponse);

    const products = await getVisualStockProducts({ startDate: "2026-09-10T22:00:00Z", endDate: "2026-09-10T22:00:00Z" });
    const extras = await getVisualStockExtras({ startDate: "2026-09-10T22:00:00Z", endDate: "2026-09-10T22:00:00Z" });

    expect(products[0].units).toBe(2);
    expect(products[0].products?.[0].units).toBe(4);
    expect(products[0].products?.[0].extras).toEqual([]);
    expect(products[0].budgets[0].budgetLines).toMatchObject([{ units: 2, extras: [{ units: 3 }] }]);
    expect(products[0].budgets[1].budgetLines).toEqual([]);
    expect(products[0].budgets[2].budgetLines).toEqual([]);
    expect(extras[0].units).toBe(3);
    expect(extras[0].budget.budgetLines).toEqual([]);
  });
});

describe("visual stock transformations", () => {
  it("groups duplicate products at index zero and preserves inventory and budget data", () => {
    const sources: VisualStockProductSource[] = [
      { id: "first", name: "Chair", units: 2, unidades: 10, products: [], budgets: [budget("a", 1)] },
      { id: "second", name: "Chair", units: 3, products: [], budgets: [budget("b", 2)] },
    ];

    expect(aggregateVisualStockProducts(sources)).toMatchObject([
      { id: "first", name: "Chair", units: 5, unidades: 10, budgets: [{ id: "a" }, { id: "b" }] },
    ]);
  });

  it("groups duplicate extras at index zero and treats missing budget-line extras as zero", () => {
    const sources: VisualStockExtraSource[] = [
      { id: "first", extraName: "Assembly", units: 2, budget: budget("a", 1) },
      { id: "second", extraName: "Assembly", units: 3, budget: budget("b", 2) },
    ];
    const grouped = aggregateVisualStockExtras(sources);

    expect(grouped[0]).toMatchObject({ extraName: "Assembly", units: 5, budgets: [{ id: "a" }, { id: "b" }] });
    expect(aggregateExtraBudgetRows(grouped[0].budgets, "Assembly")).toEqual([
      expect.objectContaining({ id: "a", extraUnits: 0 }),
      expect.objectContaining({ id: "b", extraUnits: 0 }),
    ]);
  });

  it("multiplies pack lines only when they have no objetoid and match the grouped product", () => {
    const line = { units: 2, packId: "pack-1", objetoid: "" } as BudgetLine;
    const products = [{ elemento: "Chair", units: 4 }] as BudgetLine[];

    expect(getProductBudgetUnits(line, "Chair", products)).toBe(8);
    expect(getProductBudgetUnits({ ...line, objetoid: "item-1" }, "Chair", products)).toBe(2);
  });
});
