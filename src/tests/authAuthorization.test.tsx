import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { mockLoginUser } = vi.hoisted(() => ({ mockLoginUser: vi.fn() }));

vi.mock("@/services/authService", () => ({
  loginUser: mockLoginUser,
  logoutUser: vi.fn(),
  requestPasswordChange: vi.fn(),
}));

import ProtectedRoute from "@/routes/ProtectedRoute";
import { login } from "@/redux/actions/auth";
import authReducer from "@/redux/slices/authSlice";
import {
  isAllowedPlatformRole,
  isAuthorizedPlatformSession,
  type CurrentUser,
} from "@/types/auth";

const createUser = (role?: string): CurrentUser => ({ role, id: "user" } as CurrentUser);

describe("platform role allowlist", () => {
  it.each(["ADMIN", "TECHNICIAN", "MANAGER"])("allows %s", (role) => {
    expect(isAllowedPlatformRole(role)).toBe(true);
    expect(isAuthorizedPlatformSession(true, createUser(role))).toBe(true);
  });

  it.each([undefined, "CLIENT", "USER", "UNKNOWN"])("denies %s", (role) => {
    expect(isAllowedPlatformRole(role)).toBe(false);
    expect(isAuthorizedPlatformSession(true, role ? createUser(role) : null)).toBe(false);
  });

  it("rejects a successful login response for a disallowed role", async () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    mockLoginUser.mockResolvedValue({ token: "token", currentUser: createUser("CLIENT") });

    await store.dispatch(login({ email: "client@example.com", password: "password" }));

    expect(store.getState().auth).toMatchObject({
      authenticated: false,
      token: null,
      user: null,
      loginRequest: { ok: false, messages: "No tienes permisos para acceder a la plataforma" },
    });
  });

  it.each(["ADMIN", "TECHNICIAN", "MANAGER"])("allows a persisted %s session to open a direct URL", (role) => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: { ...authReducer(undefined, { type: "init" }), authenticated: true, user: createUser(role), token: "token" } },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/stock"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/stock" element={<p>Stock visual</p>} />
            </Route>
            <Route path="/login" element={<p>Acceso</p>} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText("Stock visual")).toBeInTheDocument();
  });

  it.each(["CLIENT", "UNKNOWN", undefined])("redirects a persisted %s session from a direct URL", (role) => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: { ...authReducer(undefined, { type: "init" }), authenticated: true, user: createUser(role), token: "token" } },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/stock"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/stock" element={<p>Stock visual</p>} />
            </Route>
            <Route path="/login" element={<p>Acceso</p>} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText("Acceso")).toBeInTheDocument();
    expect(screen.queryByText("Stock visual")).not.toBeInTheDocument();
  });
});
