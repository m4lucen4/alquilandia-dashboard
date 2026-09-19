import { describe, expect, it } from "vitest";
import {
  getAdviserChartRows,
  getAdviserRevenueTotal,
  getInventoryTotalCost,
  getVatDisplayRows,
  getVatQuarterRows,
  monthNames,
  normalizeMonthlyAmounts,
  groupAdviserStatistics,
} from "@/components/accounting/statisticsUtils";

describe("statistics calculations", () => {
  it("normalizes missing months and combines duplicate monthly values", () => {
    const rows = normalizeMonthlyAmounts([
      { month: 1, totalAmount: 10 },
      { month: 1, totalAmount: 5 },
      { month: 3, totalAmount: 8 },
    ]);

    expect(rows).toHaveLength(12);
    expect(rows[0]).toEqual({ month: 1, totalAmount: 15 });
    expect(rows[1]).toEqual({ month: 2, totalAmount: 0 });
    expect(rows[2]).toEqual({ month: 3, totalAmount: 8 });
  });

  it("treats a nullable Money collection as an empty monthly series", () => {
    expect(normalizeMonthlyAmounts(null as never)).toEqual(
      Array.from({ length: 12 }, (_, index) => ({ month: index + 1, totalAmount: 0 })),
    );
  });

  it("sums every inventory price without applying the legacy divisor", () => {
    expect(getInventoryTotalCost([
      { subcategory: { nombre: "Sillas" }, price: 100 },
      { subcategory: null, price: 50 },
    ])).toBe(150);
  });

  it("calculates normalized monthly and quarterly VAT values from the confirmed formulas", () => {
    const monthly = getVatDisplayRows({
      gaining: [
        { month: 1, totalAmount: 100, totalVAT: 121 },
        { month: 1, totalAmount: 50, totalVAT: 60.5 },
        { month: 4, totalAmount: 100, totalVAT: 121 },
      ],
      expenses: [
        { month: 1, totalAmount: 121, totalVAT: 100 },
        { month: 2, totalAmount: 60.5, totalVAT: 50 },
      ],
    });

    expect(monthly[0]).toEqual({ month: 1, incomeVat: 31.5, expenseVat: 21, balance: 10.5 });
    expect(monthly[1]).toEqual({ month: 2, incomeVat: 0, expenseVat: 10.5, balance: -10.5 });
    expect(monthly[2]).toEqual({ month: 3, incomeVat: 0, expenseVat: 0, balance: 0 });
    expect(getVatQuarterRows(monthly)).toEqual([
      { label: "Primer trimestre", incomeVat: 31.5, expenseVat: 31.5, balance: 0 },
      { label: "Segundo trimestre", incomeVat: 21, expenseVat: 0, balance: 21 },
      { label: "Tercer trimestre", incomeVat: 0, expenseVat: 0, balance: 0 },
      { label: "Cuarto trimestre", incomeVat: 0, expenseVat: 0, balance: 0 },
    ]);
  });

  it("groups stable adviser identities into twelve monthly values and annual totals", () => {
    const groups = groupAdviserStatistics([
      { month: 1, totalAmount: 10.5, technician: { id: "one", firstName: "Alex", lastName: "North" } },
      { month: 1, totalAmount: -2, technician: { id: "one", firstName: "Alexandra", lastName: "North" } },
      { month: 3, totalAmount: 4, technician: { id: "one", firstName: "Alex", lastName: "North" } },
      { month: 1, totalAmount: 8, technician: { id: "two", firstName: "Alex", lastName: "North" } },
      { month: 2, totalAmount: 6, technician: { id: "", firstName: "Generado", lastName: "por la aplicación" } },
    ]);

    expect(groups).toHaveLength(3);
    expect(groups.find((group) => group.label === "Alex North (1)")?.monthlyAmounts[0].totalAmount).toBe(8.5);
    expect(groups.find((group) => group.label === "Alex North (2)")?.annualTotal).toBe(8);
    expect(groups.find((group) => group.label === "Generado por la aplicación")?.monthlyAmounts[1].totalAmount).toBe(6);
    expect(groups.every((group) => group.monthlyAmounts.length === 12)).toBe(true);
    expect(getAdviserRevenueTotal(groups)).toBe(26.5);
  });

  it("uses a supplied hash only as a fallback and keeps unidentified named rows separate", () => {
    const groups = groupAdviserStatistics([
      { month: 1, totalAmount: 4, technicianEmailHash: "synthetic-hash", technician: { id: "stable", firstName: "Casey", lastName: "One" } },
      { month: 2, totalAmount: 3, technicianEmailHash: "synthetic-hash", technician: { id: "", firstName: "Casey", lastName: "Changed" } },
      { month: 1, totalAmount: 1, technician: { id: "", firstName: "Unknown", lastName: "Person" } },
      { month: 2, totalAmount: 2, technician: { id: "", firstName: "Unknown", lastName: "Person" } },
    ]);

    expect(groups).toHaveLength(3);
    expect(groups.find((group) => group.label === "Casey One")?.annualTotal).toBe(7);
    expect(groups.filter((group) => group.isAnomaly)).toHaveLength(2);
  });

  it("creates month-only chart rows with safe series keys", () => {
    const chartRows = getAdviserChartRows(groupAdviserStatistics([
      { month: 4, totalAmount: 12, technician: { id: "person.with.dot", firstName: "Taylor", lastName: "One" } },
    ]));

    expect(chartRows).toHaveLength(12);
    expect(chartRows.map((row) => row.month)).toEqual(monthNames);
    expect(Object.keys(chartRows[3])).toEqual(["month", "series_0"]);
    expect(chartRows[3].series_0).toBe(12);
  });
});
