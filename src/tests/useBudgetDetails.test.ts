import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBudgetDetails } from "@/hooks/useBudgetDetails";
import { useAppDispatch } from "@/redux/hooks";
import {
  fetchBudgets,
  updateBudgetThunk,
} from "@/redux/actions/budgets";
import { fetchUserDetails } from "@/redux/actions/users";
import {
  getBudgetDetailsByRecordId,
} from "@/services/budgetsServices";
import type { AppDispatch } from "@/redux/store";
import type { Budget } from "@/types/budgets";

vi.mock("@/redux/hooks", () => ({
  useAppDispatch: vi.fn(),
}));

vi.mock("@/redux/actions/budgets", () => ({
  fetchBudgets: vi.fn(),
  rejectBudgetThunk: vi.fn(),
  updateBudgetThunk: Object.assign(vi.fn(), {
    fulfilled: { match: (action: { type: string }) => action.type === "budgets/update/fulfilled" },
  }),
}));

vi.mock("@/redux/actions/users", () => ({
  fetchUserDetails: vi.fn(),
}));

vi.mock("@/redux/slices/budgetWizardSlice", () => ({
  rescueBudget: vi.fn(),
  resetWizard: vi.fn(),
}));

vi.mock("@/services/budgetsServices", () => ({
  getBudgetById: vi.fn(),
  getBudgetDetailsByRecordId: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

const selectedBudget = {
  id: "budget-123",
  budgetReference: 123,
  status: "PAID",
  eventDate: "2026-12-20",
  isDelayed: false,
  user: { id: "user-123" },
} as Budget;

const freshBudget = {
  ...selectedBudget,
  eventDate: "2027-01-10",
  isDelayed: true,
  comments: "Fresh detail",
} as Budget;

describe("useBudgetDetails postponement", () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppDispatch).mockReturnValue(dispatch as unknown as AppDispatch);
  });

  it("updates fresh detail, preserves event fields, refreshes the active list and keeps success feedback", async () => {
    const updatedBudget = { ...freshBudget, status: "DELAYED" } as Budget;
    const userFetchAction = {
      type: "users/fetchDetails",
      unwrap: vi.fn().mockResolvedValue({}),
    };
    const updateAction = { type: "budgets/update" };
    const refreshAction = { type: "budgets/fetchAll" };
    vi.mocked(getBudgetDetailsByRecordId).mockResolvedValue(freshBudget);
    vi.mocked(fetchUserDetails).mockReturnValue(userFetchAction as never);
    vi.mocked(updateBudgetThunk).mockReturnValue(updateAction as never);
    vi.mocked(fetchBudgets).mockReturnValue(refreshAction as never);
    dispatch.mockImplementation((action: unknown) => {
      if (action === userFetchAction) {
        return userFetchAction;
      }
      if (action === updateAction) {
        return Promise.resolve({ type: "budgets/update/fulfilled", payload: updatedBudget });
      }
      return Promise.resolve({ type: "budgets/fetchAll/fulfilled" });
    });

    const { result } = renderHook(() =>
      useBudgetDetails({ pageIndex: 2, pageSize: 25, buildFiltersQuery: () => "status=PAID" }),
    );

    act(() => {
      result.current.showBudgetDetailsFeedback({
        title: "Previous feedback",
        description: "Previous action",
        type: "error",
      });
    });
    await act(async () => {
      await result.current.handleViewBudget(selectedBudget);
    });
    await act(async () => {
      await result.current.handlePostponeBudget();
    });

    expect(getBudgetDetailsByRecordId).toHaveBeenCalledWith(selectedBudget.id);
    expect(updateBudgetThunk).toHaveBeenCalledWith({
      budgetId: freshBudget.id,
      data: { ...freshBudget, status: "DELAYED" },
    });
    expect(vi.mocked(updateBudgetThunk).mock.calls[0][0].data).toMatchObject({
      eventDate: freshBudget.eventDate,
      isDelayed: freshBudget.isDelayed,
      status: "DELAYED",
    });
    expect(fetchBudgets).toHaveBeenCalledWith({
      pageSize: 25,
      pageToFetch: 3,
      filtersQuery: "status=PAID",
    });
    expect(result.current.selectedBudgetToView).toEqual(updatedBudget);
    expect(result.current.budgetDetailsFeedback).toEqual({
      title: "Presupuesto pospuesto",
      description: "El presupuesto 123 ha sido marcado como pospuesto",
      type: "success",
    });
  });

  it("shows an error inside the modal when the update fails", async () => {
    const userFetchAction = {
      type: "users/fetchDetails",
      unwrap: vi.fn().mockResolvedValue({}),
    };
    const updateAction = { type: "budgets/update" };
    vi.mocked(getBudgetDetailsByRecordId).mockResolvedValue(freshBudget);
    vi.mocked(fetchUserDetails).mockReturnValue(userFetchAction as never);
    vi.mocked(updateBudgetThunk).mockReturnValue(updateAction as never);
    dispatch.mockImplementation((action: unknown) =>
      action === userFetchAction
        ? userFetchAction
        : Promise.resolve(
            action === updateAction
              ? { type: "budgets/update/rejected", payload: "No autorizado" }
              : { type: "users/fetchDetails/fulfilled" },
          ),
    );

    const { result } = renderHook(() =>
      useBudgetDetails({ pageIndex: 0, pageSize: 10, buildFiltersQuery: () => "" }),
    );

    await act(async () => {
      await result.current.handleViewBudget(selectedBudget);
    });
    await act(async () => {
      await result.current.handlePostponeBudget();
    });

    expect(result.current.budgetDetailsFeedback).toEqual({
      title: "Error al posponer presupuesto",
      description: "No autorizado",
      type: "error",
    });
    expect(fetchBudgets).not.toHaveBeenCalled();
  });

  it("shows loading during the initial detail request and prevents duplicate submissions", async () => {
    const userFetchAction = {
      type: "users/fetchDetails",
      unwrap: vi.fn().mockResolvedValue({}),
    };
    let resolveFreshBudget: (budget: Budget) => void = () => undefined;
    const freshBudgetRequest = new Promise<Budget>((resolve) => {
      resolveFreshBudget = resolve;
    });

    vi.mocked(fetchUserDetails).mockReturnValue(userFetchAction as never);
    vi.mocked(getBudgetDetailsByRecordId).mockReturnValue(freshBudgetRequest);
    dispatch.mockImplementation((action: unknown) =>
      action === userFetchAction
        ? userFetchAction
        : Promise.resolve({ type: "budgets/update/rejected", payload: "Ignored" }),
    );

    const { result } = renderHook(() =>
      useBudgetDetails({ pageIndex: 0, pageSize: 10, buildFiltersQuery: () => "" }),
    );

    await act(async () => {
      await result.current.handleViewBudget(selectedBudget);
    });
    let firstRequest: Promise<void> = Promise.resolve();
    await act(async () => {
      firstRequest = result.current.handlePostponeBudget();
      await result.current.handlePostponeBudget();
    });

    expect(result.current.isPostponing).toBe(true);
    expect(getBudgetDetailsByRecordId).toHaveBeenCalledTimes(1);

    resolveFreshBudget(freshBudget);
    await act(async () => {
      await firstRequest;
    });
  });

  it("refuses the update when fresh detail is no longer eligible for postponement", async () => {
    const userFetchAction = {
      type: "users/fetchDetails",
      unwrap: vi.fn().mockResolvedValue({}),
    };
    vi.mocked(fetchUserDetails).mockReturnValue(userFetchAction as never);
    vi.mocked(getBudgetDetailsByRecordId).mockResolvedValue({
      ...freshBudget,
      status: "DRAFT",
    });
    dispatch.mockImplementation((action: unknown) =>
      action === userFetchAction
        ? userFetchAction
        : Promise.resolve({ type: "users/fetchDetails/fulfilled" }),
    );

    const { result } = renderHook(() =>
      useBudgetDetails({ pageIndex: 0, pageSize: 10, buildFiltersQuery: () => "" }),
    );

    await act(async () => {
      await result.current.handleViewBudget(selectedBudget);
    });
    await act(async () => {
      await result.current.handlePostponeBudget();
    });

    expect(updateBudgetThunk).not.toHaveBeenCalled();
    expect(result.current.budgetDetailsFeedback).toEqual({
      title: "No se puede posponer el presupuesto",
      description: "El presupuesto 123 ya no tiene un estado apto para posponerlo",
      type: "error",
    });
  });

  it("ignores a stale request after closing and switching the viewed budget", async () => {
    const userFetchAction = {
      type: "users/fetchDetails",
      unwrap: vi.fn().mockResolvedValue({}),
    };
    const secondBudget = { ...selectedBudget, id: "budget-456", budgetReference: 456 } as Budget;
    let resolveFreshBudget: (budget: Budget) => void = () => undefined;
    const freshBudgetRequest = new Promise<Budget>((resolve) => {
      resolveFreshBudget = resolve;
    });

    vi.mocked(fetchUserDetails).mockReturnValue(userFetchAction as never);
    vi.mocked(getBudgetDetailsByRecordId).mockReturnValue(freshBudgetRequest);
    dispatch.mockImplementation((action: unknown) =>
      action === userFetchAction
        ? userFetchAction
        : Promise.resolve({ type: "users/fetchDetails/fulfilled" }),
    );

    const { result } = renderHook(() =>
      useBudgetDetails({ pageIndex: 0, pageSize: 10, buildFiltersQuery: () => "" }),
    );

    await act(async () => {
      await result.current.handleViewBudget(selectedBudget);
    });
    let firstRequest: Promise<void> = Promise.resolve();
    act(() => {
      firstRequest = result.current.handlePostponeBudget();
    });
    act(() => {
      result.current.handleCloseViewBudgetModal();
    });
    await act(async () => {
      await result.current.handleViewBudget(secondBudget);
    });
    resolveFreshBudget(freshBudget);
    await act(async () => {
      await firstRequest;
    });

    expect(updateBudgetThunk).not.toHaveBeenCalled();
    expect(result.current.selectedBudgetToView).toEqual(secondBudget);
    expect(result.current.budgetDetailsFeedback).toBeNull();
  });

  it("refuses the update when the fetched detail belongs to another budget", async () => {
    const userFetchAction = {
      type: "users/fetchDetails",
      unwrap: vi.fn().mockResolvedValue({}),
    };
    vi.mocked(fetchUserDetails).mockReturnValue(userFetchAction as never);
    vi.mocked(getBudgetDetailsByRecordId).mockResolvedValue({
      ...freshBudget,
      id: "budget-456",
    });
    dispatch.mockImplementation((action: unknown) =>
      action === userFetchAction
        ? userFetchAction
        : Promise.resolve({ type: "users/fetchDetails/fulfilled" }),
    );

    const { result } = renderHook(() =>
      useBudgetDetails({ pageIndex: 0, pageSize: 10, buildFiltersQuery: () => "" }),
    );

    await act(async () => {
      await result.current.handleViewBudget(selectedBudget);
    });
    await act(async () => {
      await result.current.handlePostponeBudget();
    });

    expect(updateBudgetThunk).not.toHaveBeenCalled();
    expect(result.current.budgetDetailsFeedback).toEqual({
      title: "Error al posponer presupuesto",
      description: "El detalle obtenido no corresponde al presupuesto seleccionado",
      type: "error",
    });
  });
});
