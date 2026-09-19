import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Outlet, RouterProvider, createMemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/types/auth";

const { mockApiClient } = vi.hoisted(() => ({ mockApiClient: vi.fn() }));

vi.mock("@/services/api", () => ({ apiClient: mockApiClient }));
vi.mock("@/services/statisticsVatService", () => ({
  fetchScopedVatStatistics: vi.fn(async () => ({ expenses: [], gaining: [] })),
}));
vi.mock("@/layouts/MainLayout", () => ({ default: () => <Outlet /> }));
vi.mock("@/pages/Home", () => ({ Home: () => <h1>Home route</h1> }));
vi.mock("@/pages/Login", () => ({ Login: () => <h1>Login route</h1> }));

import authReducer from "@/redux/slices/authSlice";
import statisticsReducer from "@/redux/slices/statisticsSlice";
import { router } from "@/routes/index";

const createUser = (role: string): CurrentUser => ({ id: "user", role } as CurrentUser);

const createStore = (role?: string, authenticated = true) => configureStore({
  reducer: {
    auth: authReducer,
    statistics: statisticsReducer,
  },
  preloadedState: {
    auth: {
      ...authReducer(undefined, { type: "init" }),
      authenticated,
      user: role ? createUser(role) : null,
      token: role ? "token" : null,
    },
  },
});

const renderRoute = (role?: string, authenticated = true, path = "/accounting/statistics") => {
  const store = createStore(role, authenticated);
  const memoryRouter = createMemoryRouter(router.routes, { initialEntries: [path] });

  return render(
    <Provider store={store}>
      <RouterProvider router={memoryRouter} />
    </Provider>,
  );
};

afterEach(() => {
  mockApiClient.mockReset();
});

describe("Accounting Statistics authorization", () => {
  it("uses the exported application routes for ADMIN card navigation and Statistics rendering", async () => {
    mockApiClient.mockImplementation((endpoint: string) => Promise.resolve({
      json: () => Promise.resolve(endpoint === "/statistics/inventory"
        ? []
        : endpoint.includes("adviser")
          ? []
          : { expenses: [], gaining: [] }),
    }));

    renderRoute("ADMIN", true, "/accounting");

    await userEvent.click(screen.getByRole("button", { name: "Navegar a Estadísticas" }));
    expect(await screen.findByRole("heading", { name: "Estadísticas" })).toBeInTheDocument();
    await waitFor(() => expect(mockApiClient).toHaveBeenCalledTimes(3));
  });

  it.each(["MANAGER", "TECHNICIAN"])("redirects %s direct access before Statistics requests", async (role) => {
    renderRoute(role);

    expect(await screen.findByRole("heading", { name: "Home route" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Estadísticas" })).not.toBeInTheDocument();
    expect(mockApiClient).not.toHaveBeenCalled();
  });

  it("redirects anonymous direct access to login before Statistics requests", async () => {
    renderRoute(undefined, false);

    expect(await screen.findByRole("heading", { name: "Login route" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Estadísticas" })).not.toBeInTheDocument();
    expect(mockApiClient).not.toHaveBeenCalled();
  });
});
