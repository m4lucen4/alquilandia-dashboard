import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}));

vi.mock("@/config/supabase", () => ({
  supabase: {
    from: mockFrom,
  },
}));

import { getAllInvoices } from "@/services/invoicesService";

interface QueryResponse {
  data: unknown[] | null;
  error: { message?: string } | null;
  count: number | null;
}

interface QueryBuilder {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  ilike: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  then: (
    onfulfilled?: (response: QueryResponse) => unknown,
  ) => Promise<unknown>;
}

const createQueryBuilder = (response: QueryResponse): QueryBuilder => {
  const builder: QueryBuilder = {
    select: vi.fn(),
    eq: vi.fn(),
    ilike: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    then: (onfulfilled) => Promise.resolve(response).then(onfulfilled),
  };

  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.ilike.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.range.mockReturnValue(builder);

  return builder;
};

describe("getAllInvoices", () => {
  let queryBuilder: QueryBuilder;

  beforeEach(() => {
    queryBuilder = createQueryBuilder({
      data: [
        {
          id: "invoice-1",
          invoice_number: 12,
          budget_reference: 456,
          total: "124.5",
          business: { id: "business-1", name: "Default", is_default: true },
          invoices_type: { id: "type-1", invoices: "Final" },
        },
      ],
      error: null,
      count: 1014,
    });
    mockFrom.mockReturnValue(queryBuilder);
  });

  it("selects only listing fields and requests a planned count", async () => {
    await getAllInvoices(undefined, undefined, 0, 10);

    const [selection, options] = queryBuilder.select.mock.calls[0] as [
      string,
      { count: string },
    ];

    expect(selection).toContain("total:price->>total");
    expect(selection).toContain("business:business_id");
    expect(selection).toContain("invoices_type:invoices_type_id");
    expect(selection).not.toContain("budgetlines");
    expect(selection).not.toContain("\n      *,");
    expect(options).toEqual({ count: "planned" });
  });

  it("applies existing filters before ordering and server pagination", async () => {
    await getAllInvoices("business-1", "456", 2, 10, "2026/0012", "Ada");

    expect(queryBuilder.eq).toHaveBeenNthCalledWith(1, "business_id", "business-1");
    expect(queryBuilder.eq).toHaveBeenNthCalledWith(2, "budget_reference", 456);
    expect(queryBuilder.eq).toHaveBeenNthCalledWith(3, "invoice_number", 12);
    expect(queryBuilder.ilike).toHaveBeenCalledWith("client_name", "%Ada%");
    expect(queryBuilder.order).toHaveBeenNthCalledWith(
      1,
      "business(is_default)",
      { ascending: false },
    );
    expect(queryBuilder.order).toHaveBeenNthCalledWith(
      2,
      "invoice_number",
      { ascending: false },
    );
    expect(queryBuilder.order).toHaveBeenNthCalledWith(3, "id", {
      ascending: true,
    });
    expect(queryBuilder.range).toHaveBeenCalledWith(20, 29);
  });

  it("keeps the invoices and total response contract with a numeric total", async () => {
    await expect(getAllInvoices(undefined, undefined, 0, 10)).resolves.toEqual({
      invoices: [
        expect.objectContaining({
          id: "invoice-1",
          total: 124.5,
        }),
      ],
      total: 1014,
    });
  });

  it("uses the first page by default instead of fetching the full table", async () => {
    await getAllInvoices();

    expect(queryBuilder.range).toHaveBeenCalledWith(0, 9);
  });
});
