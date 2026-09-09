import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BudgetStep2EventDetails } from "./BudgetStep2EventDetails";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  state: {} as Record<string, unknown>,
  computeRoutes: vi.fn(),
}));

vi.mock("@/redux/hooks", () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mocks.state),
}));

vi.mock("@/redux/actions/budgets", () => ({
  updateBudgetEventDetailsThunk: vi.fn(),
}));

vi.mock("@/redux/actions/warehouses", () => ({
  fetchAllWarehouses: vi.fn(() => ({ type: "warehouses/fetchAll" })),
}));

vi.mock("@/components/shared/googleMaps", () => ({
  loadGoogleMaps: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/components/shared/CalendarPicker", () => ({
  CalendarPicker: () => null,
}));

vi.mock("@/components/shared/InputField", () => ({
  default: () => null,
}));

vi.mock("@/components/shared/Button", () => ({
  default: ({
    title,
    disabled,
    type,
  }: {
    title: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
  }) => (
    <button disabled={disabled} type={type}>
      {title}
    </button>
  ),
}));

vi.mock("@/components/shared/PlacesAutocompleteField", () => ({
  PlacesAutocompleteField: ({
    onLocationChange,
  }: {
    onLocationChange?: (location: { latitude: string; longitude: string }) => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() => onLocationChange?.({ latitude: "37.3", longitude: "-5.8" })}
      >
        Select first address
      </button>
      <button
        type="button"
        onClick={() => onLocationChange?.({ latitude: "37.2", longitude: "-5.7" })}
      >
        Select second address
      </button>
    </div>
  ),
}));

const warehouse = {
  id: "warehouse-a",
  name: "Warehouse A",
  latitude: 37.4,
  longitude: -5.9,
  address: "Address A",
  use_for_mileage: true,
};

const setState = () => {
  mocks.state = {
    budgetWizard: {
      budgetId: null,
      budget: null,
      updateEventDetailsRequest: { inProgress: false, messages: "", ok: false },
    },
    warehouses: {
      warehouses: [warehouse],
      fetchWarehousesRequest: { inProgress: false, messages: "", ok: true },
    },
  };
};

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

const createDeferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
};

describe("BudgetStep2EventDetails mileage lifecycle", () => {
  beforeEach(() => {
    setState();
    mocks.dispatch.mockReset();
    mocks.computeRoutes.mockReset();
    Object.defineProperty(globalThis, "google", {
      configurable: true,
      value: {
        maps: {
          importLibrary: vi.fn().mockResolvedValue({
            Route: { computeRoutes: mocks.computeRoutes },
          }),
        },
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("shows an actionable instruction and blocks delivery until an autocomplete location is selected", () => {
    render(<BudgetStep2EventDetails />);

    expect(screen.getByText(/Selecciona una dirección del autocompletado/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
  });

  it("ignores a late route response after a newer address selection", async () => {
    const firstRoute = createDeferred<{ routes: [{ distanceMeters: number }] }>();
    const secondRoute = createDeferred<{ routes: [{ distanceMeters: number }] }>();
    mocks.computeRoutes.mockReturnValueOnce(firstRoute.promise).mockReturnValueOnce(secondRoute.promise);
    const user = userEvent.setup();

    render(<BudgetStep2EventDetails />);
    await user.click(screen.getByRole("button", { name: "Select first address" }));
    await waitFor(() => expect(mocks.computeRoutes).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "Select second address" }));
    await waitFor(() => expect(mocks.computeRoutes).toHaveBeenCalledTimes(2));

    await act(async () => {
      firstRoute.resolve({ routes: [{ distanceMeters: 10000 }] });
    });
    expect(screen.queryByText("10 km")).not.toBeInTheDocument();

    await act(async () => {
      secondRoute.resolve({ routes: [{ distanceMeters: 20000 }] });
    });
    await waitFor(() => expect(screen.getByText("20 km")).toBeVisible());
  });

  it("clears and invalidates an active route while warehouses are loading", async () => {
    const pendingRoute = createDeferred<{ routes: [{ distanceMeters: number }] }>();
    mocks.computeRoutes.mockReturnValueOnce(pendingRoute.promise);
    const user = userEvent.setup();
    const { rerender } = render(<BudgetStep2EventDetails />);

    await user.click(screen.getByRole("button", { name: "Select first address" }));
    await waitFor(() => expect(mocks.computeRoutes).toHaveBeenCalledTimes(1));

    mocks.state = {
      ...mocks.state,
      warehouses: {
        warehouses: [warehouse],
        fetchWarehousesRequest: { inProgress: true, messages: "", ok: false },
      },
    };
    rerender(<BudgetStep2EventDetails />);

    expect(screen.getByRole("status")).toHaveTextContent("Calculando distancia por carretera...");

    await act(async () => {
      pendingRoute.resolve({ routes: [{ distanceMeters: 10000 }] });
    });
    expect(screen.queryByText("10 km")).not.toBeInTheDocument();
  });
});
