import { beforeEach, describe, expect, it, vi } from "vitest";

interface QueryResult {
  data: unknown;
  error: { message: string } | null;
  count: number | null;
}

const { mockFrom, mockFetchLegacy } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockFetchLegacy: vi.fn(),
}));

vi.mock("@/config/supabase", () => ({ supabase: { from: mockFrom } }));
vi.mock("@/services/statisticsService", () => ({ fetchVatStatistics: mockFetchLegacy }));

import { fetchEventosVatStatistics, fetchScopedVatStatistics } from "@/services/statisticsVatService";

const validLegacy = {
  expenses: [{ month: 7, totalAmount: 121, totalVAT: 100 }],
  gaining: [{ month: 7, totalAmount: 100, totalVAT: 121 }],
};

const createInvoicesQuery = (pages: QueryResult[], calls: string[][]) => {
  const query = {
    select: vi.fn((...args: unknown[]) => {
      calls.push(["select", String(args[0]), JSON.stringify(args[1])]);
      return query;
    }),
    eq: vi.fn((...args: unknown[]) => { calls.push(["eq", ...args.map(String)]); return query; }),
    gte: vi.fn((...args: unknown[]) => { calls.push(["gte", ...args.map(String)]); return query; }),
    lt: vi.fn((...args: unknown[]) => { calls.push(["lt", ...args.map(String)]); return query; }),
    order: vi.fn((...args: unknown[]) => { calls.push(["order", String(args[0])]); return query; }),
    range: vi.fn(() => Promise.resolve(pages.shift())),
  };
  return query;
};

const setupSupabase = (pages: QueryResult[], businessData: unknown = [{ id: "eventos", name: "Alquilandia Eventos S.L." }]) => {
  const calls: string[][] = [];
  const invoicesQuery = createInvoicesQuery(pages, calls);
  mockFrom.mockImplementation((table: string) => {
    if (table === "business") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: businessData, error: null })),
        })),
      };
    }
    return invoicesQuery;
  });
  return { calls, invoicesQuery };
};

describe("statistics VAT service", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockFetchLegacy.mockReset();
    mockFetchLegacy.mockResolvedValue(validLegacy);
  });

  it("uses exact, scoped, ordered pagination and sums signed VAT once", async () => {
    const { calls, invoicesQuery } = setupSupabase([
      { count: 2, error: null, data: [{ id: "a", business_id: "eventos", created_at: "2026-07-01T00:00:00+00:00", vat: "12.5" }] },
      { count: 2, error: null, data: [{ id: "b", business_id: "eventos", created_at: "2026-12-31T23:00:00+00:00", vat: "-2.5" }] },
    ]);

    await expect(fetchEventosVatStatistics(2026)).resolves.toEqual({
      expenses: [],
      gaining: expect.arrayContaining([
        expect.objectContaining({ month: 7, totalVAT: 12.5 }),
        expect.objectContaining({ month: 12, totalVAT: -2.5 }),
      ]),
    });
    expect(calls).toEqual(expect.arrayContaining([
      ["select", "id, business_id, created_at, vat:price->>vat", '{"count":"exact"}'],
      ["eq", "business_id", "eventos"],
      ["gte", "created_at", "2026-07-01T00:00:00.000Z"],
      ["lt", "created_at", "2027-01-01T00:00:00.000Z"],
      ["order", "created_at"],
      ["order", "id"],
    ]));
    expect(invoicesQuery.range).toHaveBeenNthCalledWith(1, 0, 249);
    expect(invoicesQuery.range).toHaveBeenNthCalledWith(2, 1, 250);
  });

  it("advances by received rows when the server caps a page", async () => {
    const rows = Array.from({ length: 3 }, (_, index) => ({
      id: `invoice-${index}`,
      business_id: "eventos",
      created_at: "2027-01-02T00:00:00Z",
      vat: "1",
    }));
    const { invoicesQuery } = setupSupabase([
      { count: 3, error: null, data: rows.slice(0, 2) },
      { count: 3, error: null, data: rows.slice(2) },
    ]);

    await expect(fetchEventosVatStatistics(2027)).resolves.toEqual(expect.objectContaining({
      gaining: expect.arrayContaining([expect.objectContaining({ month: 1, totalVAT: 3 })]),
    }));
    expect(invoicesQuery.range).toHaveBeenNthCalledWith(2, 2, 251);
  });

  it.each([
    ["null count", { count: null, error: null, data: [] }],
    ["negative count", { count: -1, error: null, data: [] }],
    ["fractional count", { count: 1.5, error: null, data: [] }],
    ["missing data", { count: 0, error: null, data: null }],
    ["premature empty page", { count: 1, error: null, data: [] }],
    ["failed page", { count: 0, error: { message: "page failed" }, data: [] }],
  ])("rejects incomplete %s reads", async (_, response) => {
    setupSupabase([response]);
    await expect(fetchEventosVatStatistics(2027)).rejects.toThrow();
  });

  it.each([
    ["duplicate ids", [{ id: "same", business_id: "eventos", created_at: "2027-01-02T00:00:00Z", vat: "1" }, { id: "same", business_id: "eventos", created_at: "2027-01-03T00:00:00Z", vat: "1" }]],
    ["wrong company", [{ id: "one", business_id: "other", created_at: "2027-01-02T00:00:00Z", vat: "1" }]],
    ["out of period", [{ id: "one", business_id: "eventos", created_at: "2026-12-31T23:00:00Z", vat: "1" }]],
    ["invalid VAT", [{ id: "one", business_id: "eventos", created_at: "2027-01-02T00:00:00Z", vat: "0x10" }]],
  ])("rejects %s", async (_, data) => {
    setupSupabase([{ count: data.length, error: null, data }]);
    await expect(fetchEventosVatStatistics(2027)).rejects.toThrow();
  });

  it("accepts only a complete empty result as zero", async () => {
    setupSupabase([{ count: 0, error: null, data: [] }]);
    await expect(fetchEventosVatStatistics(2027)).resolves.toEqual({
      expenses: [],
      gaining: expect.arrayContaining([expect.objectContaining({ month: 1, totalVAT: 0 })]),
    });
  });

  it("rejects a changing exact count and retains legacy rows only in historical scope", async () => {
    setupSupabase([
      { count: 2, error: null, data: [{ id: "one", business_id: "eventos", created_at: "2027-01-02T00:00:00Z", vat: "1" }] },
      { count: 3, error: null, data: [{ id: "two", business_id: "eventos", created_at: "2027-01-03T00:00:00Z", vat: "1" }] },
    ]);
    await expect(fetchEventosVatStatistics(2027)).rejects.toThrow("cambió");

    mockFetchLegacy.mockResolvedValue({
      expenses: [{ month: 1, totalAmount: 121, totalVAT: 100 }],
      gaining: [{ month: 1, totalAmount: 100, totalVAT: 121 }],
    });
    await expect(fetchScopedVatStatistics(2026, "historical")).resolves.toEqual({
      expenses: [{ month: 1, totalAmount: 121, totalVAT: 100 }],
      gaining: [{ month: 1, totalAmount: 100, totalVAT: 121 }],
    });
  });

  it("rejects unavailable years before business or legacy network reads", async () => {
    await expect(fetchEventosVatStatistics(2025)).rejects.toThrow();
    await expect(fetchScopedVatStatistics(2027, "historical")).rejects.toThrow();
    await expect(fetchScopedVatStatistics(2016, "historical")).rejects.toThrow();
    expect(mockFrom).not.toHaveBeenCalled();
    expect(mockFetchLegacy).not.toHaveBeenCalled();
  });

  it("does not validate ignored legacy gaining for Eventos, but preserves historical validation", async () => {
    mockFetchLegacy.mockResolvedValue({ expenses: validLegacy.expenses, gaining: null });
    setupSupabase([{ count: 0, error: null, data: [] }]);

    await expect(fetchScopedVatStatistics(2026, "eventos")).resolves.toEqual(expect.objectContaining({
      expenses: [{ month: 7, totalAmount: 121, totalVAT: 100 }],
    }));
    await expect(fetchScopedVatStatistics(2026, "historical")).rejects.toThrow();
  });

  it.each([[[]], [[{ id: "one", name: "Alquilandia Eventos S.L." }, { id: "two", name: "Alquilandia Eventos S.L." }]]])(
    "rejects missing or ambiguous Eventos business resolution",
    async (businessData) => {
      setupSupabase([], businessData);
      await expect(fetchEventosVatStatistics(2027)).rejects.toThrow("No se pudo resolver de forma única");
    },
  );
});
