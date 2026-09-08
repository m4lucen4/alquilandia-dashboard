import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockApiClient } = vi.hoisted(() => ({
  mockApiClient: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  apiClient: mockApiClient,
}));

import { getBudgetDetailsByRecordId } from "@/services/budgetsServices";

describe("getBudgetDetailsByRecordId", () => {
  beforeEach(() => {
    mockApiClient.mockReset();
  });

  it("requests the legacy detail endpoint using the budget record ID", async () => {
    const budget = { id: "record-123" };
    mockApiClient.mockResolvedValue({ json: vi.fn().mockResolvedValue(budget) });

    await expect(getBudgetDetailsByRecordId("record-123")).resolves.toEqual(budget);

    expect(mockApiClient).toHaveBeenCalledWith("/budgets/details/record-123");
  });
});
