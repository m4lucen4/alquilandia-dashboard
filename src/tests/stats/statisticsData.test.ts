import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockApiClient } = vi.hoisted(() => ({ mockApiClient: vi.fn() }));

vi.mock("@/services/api", () => ({ apiClient: mockApiClient }));

import {
  fetchAdviserStatistics,
  fetchInventoryStatistics,
  fetchMoneyStatistics,
  fetchVatStatistics,
} from "@/services/statisticsService";
import {
  fetchAdviserStatisticsThunk,
  fetchInventoryStatisticsThunk,
  fetchMoneyStatisticsThunk,
  fetchVatStatisticsThunk,
} from "@/redux/actions/statistics";
import { logout } from "@/redux/actions/auth";
import statisticsReducer, { clearStatistics } from "@/redux/slices/statisticsSlice";

const money = { expenses: [{ month: 1, totalAmount: 10 }], gaining: [{ month: 1, totalAmount: 20 }] };

describe("statistics services", () => {
  beforeEach(() => {
    mockApiClient.mockReset();
    mockApiClient.mockResolvedValue({ json: vi.fn().mockResolvedValue(money) });
  });

  it.each([
    ["money", () => fetchMoneyStatistics(2026), "/statistics/money/2026"],
    ["adviser", () => fetchAdviserStatistics(2026), "/statistics/adviser/2026"],
    ["inventory", () => fetchInventoryStatistics(), "/statistics/inventory"],
    ["vat", () => fetchVatStatistics(2026), "/statistics/vat/2026"],
  ])("requests the %s endpoint through apiClient", async (_, request, endpoint) => {
    await expect(request()).resolves.toBeDefined();
    expect(mockApiClient).toHaveBeenCalledWith(endpoint);
  });

  it("projects adviser responses to the required client-side fields", async () => {
    const response = [{
      id: { month: 2, technicianEmailHash: "synthetic-hash" },
      technicianEmailHash: "synthetic-hash",
      month: 2,
      totalAmount: 12.5,
      technician: {
        id: "synthetic-id",
        firstName: "Jordan",
        lastName: "River",
        ignoredField: "remove-me",
      },
      unrelatedField: "remove-me",
    }];
    mockApiClient.mockResolvedValue({ json: vi.fn().mockResolvedValue(response) });

    await expect(fetchAdviserStatistics(2026)).resolves.toEqual([{
      month: 2,
      totalAmount: 12.5,
      technicianEmailHash: "synthetic-hash",
      technician: { id: "synthetic-id", firstName: "Jordan", lastName: "River" },
    }]);
  });

  it("normalizes null Money collections without accepting malformed non-null values", async () => {
    mockApiClient.mockResolvedValue({
      json: vi.fn().mockResolvedValue({ expenses: null, gaining: null }),
    });

    await expect(fetchMoneyStatistics(2027)).resolves.toEqual({ expenses: [], gaining: [] });

    mockApiClient.mockResolvedValue({
      json: vi.fn().mockResolvedValue({ expenses: {}, gaining: [] }),
    });

    await expect(fetchMoneyStatistics(2027)).resolves.toEqual({ expenses: {}, gaining: [] });
  });
});

describe("statistics slice", () => {
  it("keeps independent idle request states and is not persisted by the reducer", () => {
    const state = statisticsReducer(undefined, { type: "init" });
    expect(state.fetchMoneyRequest).toEqual({ inProgress: false, messages: "", ok: false });
    expect(state.fetchAdviserRequest).toEqual({ inProgress: false, messages: "", ok: false });
    expect(state.fetchInventoryRequest).toEqual({ inProgress: false, messages: "", ok: false });
    expect(state.fetchVatRequest).toEqual({ inProgress: false, messages: "", ok: false });
  });

  it("stores only the latest fulfilled response and ignores stale rejections", () => {
    let state = statisticsReducer(undefined, fetchMoneyStatisticsThunk.pending("old", 2025));
    state = statisticsReducer(state, fetchMoneyStatisticsThunk.pending("new", 2026));
    state = statisticsReducer(state, fetchMoneyStatisticsThunk.fulfilled(money, "new", 2026));
    state = statisticsReducer(state, fetchMoneyStatisticsThunk.rejected(null, "old", 2025, "old error"));

    expect(state.money).toEqual(money);
    expect(state.fetchMoneyRequest).toEqual({ inProgress: false, messages: "", ok: true });
  });

  it("records a current rejected request and resets all resources", () => {
    let state = statisticsReducer(undefined, fetchMoneyStatisticsThunk.pending("current", 2026));
    state = statisticsReducer(state, fetchMoneyStatisticsThunk.rejected(null, "current", 2026, "Network error"));
    expect(state.fetchMoneyRequest).toEqual({ inProgress: false, messages: "Network error", ok: false });

    const store = configureStore({ reducer: { statistics: statisticsReducer } });
    store.dispatch(clearStatistics());
    expect(store.getState().statistics.money).toBeNull();
  });

  it("ignores stale fulfilled and rejected Adviser requests", () => {
    const adviser = [{ month: 1, totalAmount: 10, technician: { id: "test-id", firstName: "Ana", lastName: "López" } }];
    let state = statisticsReducer(undefined, fetchAdviserStatisticsThunk.pending("old", 2026));
    state = statisticsReducer(state, fetchAdviserStatisticsThunk.pending("new", 2026));
    state = statisticsReducer(state, fetchAdviserStatisticsThunk.fulfilled(adviser, "new", 2026));
    state = statisticsReducer(state, fetchAdviserStatisticsThunk.rejected(null, "old", 2026, "old error"));

    expect(state.adviser).toEqual(adviser);
  });

  it("ignores stale fulfilled and rejected Inventory requests", () => {
    const inventory = [{ subcategory: { nombre: "Sillas" }, price: 10 }];
    let state = statisticsReducer(undefined, fetchInventoryStatisticsThunk.pending("old", undefined));
    state = statisticsReducer(state, fetchInventoryStatisticsThunk.pending("new", undefined));
    state = statisticsReducer(state, fetchInventoryStatisticsThunk.fulfilled(inventory, "new", undefined));
    state = statisticsReducer(state, fetchInventoryStatisticsThunk.rejected(null, "old", undefined, "old error"));

    expect(state.inventory).toEqual(inventory);
  });

  it("ignores stale fulfilled and rejected VAT requests", () => {
    const vat = { expenses: [{ month: 1, totalAmount: 121, totalVAT: 100 }], gaining: [{ month: 1, totalAmount: 100, totalVAT: 121 }] };
    const oldArgument = { year: 2026, scope: "historical" as const };
    const newArgument = { year: 2026, scope: "eventos" as const };
    let state = statisticsReducer(undefined, fetchVatStatisticsThunk.pending("old", oldArgument));
    state = statisticsReducer(state, fetchVatStatisticsThunk.pending("new", newArgument));
    state = statisticsReducer(state, fetchVatStatisticsThunk.fulfilled({
      vat,
      metadata: { year: 2026, scope: "historical", businessName: "Histórico anterior al corte" },
    }, "new", newArgument));
    state = statisticsReducer(state, fetchVatStatisticsThunk.rejected(null, "old", oldArgument, "old error"));

    expect(state.vat).toEqual(vat);
    expect(state.vatMetadata).toEqual({ year: 2026, scope: "historical", businessName: "Histórico anterior al corte" });
  });

  it("clears VAT data on a newer request and ignores its late rejection after a later success", () => {
    const historical = { year: 2026, scope: "historical" as const };
    const eventos = { year: 2026, scope: "eventos" as const };
    const vat = { expenses: [], gaining: [] };
    let state = statisticsReducer(undefined, fetchVatStatisticsThunk.pending("old", historical));
    state = statisticsReducer(state, fetchVatStatisticsThunk.fulfilled({
      vat,
      metadata: { year: 2026, scope: "historical", businessName: "Histórico anterior al corte" },
    }, "old", historical));
    state = statisticsReducer(state, fetchVatStatisticsThunk.pending("new", eventos));

    expect(state.vat).toBeNull();
    expect(state.vatMetadata).toBeNull();

    state = statisticsReducer(state, fetchVatStatisticsThunk.fulfilled({
      vat,
      metadata: { year: 2026, scope: "eventos", businessName: "Alquilandia Eventos" },
    }, "new", eventos));
    state = statisticsReducer(state, fetchVatStatisticsThunk.rejected(null, "old", historical, "old error"));

    expect(state.vatMetadata?.scope).toBe("eventos");
    expect(state.fetchVatRequest.ok).toBe(true);
  });

  it("does not allow a response that arrived after logout to repopulate statistics", () => {
    let state = statisticsReducer(undefined, fetchMoneyStatisticsThunk.pending("request", 2026));
    state = statisticsReducer(state, logout.fulfilled(undefined, "logout", undefined));
    state = statisticsReducer(state, fetchMoneyStatisticsThunk.fulfilled(money, "request", 2026));

    expect(state.money).toBeNull();
    expect(state.fetchMoneyRequest).toEqual({ inProgress: false, messages: "", ok: false });
  });
});
