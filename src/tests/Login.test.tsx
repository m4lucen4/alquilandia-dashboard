import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Login } from "../pages/Login";
import * as hooks from "../redux/hooks";
import * as authSlice from "../redux/slices/authSlice";
import * as authActions from "../redux/actions/auth";

vi.mock("../redux/hooks");
vi.mock("../redux/slices/authSlice");
vi.mock("../redux/actions/auth");

describe("Login", () => {
  const mockDispatch = vi.fn();
  const mockUseAppSelector = vi.fn();
  const mockUseAppDispatch = vi.fn(() => mockDispatch);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(hooks, "useAppDispatch").mockImplementation(mockUseAppDispatch);
    vi.spyOn(hooks, "useAppSelector").mockImplementation(mockUseAppSelector);
  });

  it("should render login form", () => {
    mockUseAppSelector.mockReturnValue({
      messages: null,
      inProgress: false,
      ok: false,
    });

    render(<Login />);

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
  });

  it("should show error alert when login fails", () => {
    mockUseAppSelector.mockReturnValue({
      messages: "Credenciales incorrectas",
      inProgress: false,
      ok: false,
    });

    render(<Login />);

    expect(
      screen.getByText(/error en el inicio de sesión/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/credenciales incorrectas/i)).toBeInTheDocument();
  });

  it("should not show error alert when login is in progress", () => {
    mockUseAppSelector.mockReturnValue({
      messages: "Credenciales incorrectas",
      inProgress: true,
      ok: false,
    });

    render(<Login />);

    expect(
      screen.queryByText(/error en el inicio de sesión/i),
    ).not.toBeInTheDocument();
  });

  it("should not show error alert when login is successful", () => {
    mockUseAppSelector.mockReturnValue({
      messages: null,
      inProgress: false,
      ok: true,
    });

    render(<Login />);

    expect(
      screen.queryByText(/error en el inicio de sesión/i),
    ).not.toBeInTheDocument();
  });

  it("should dispatch clearLoginErrors when closing alert", async () => {
    mockUseAppSelector.mockReturnValue({
      messages: "Error de prueba",
      inProgress: false,
      ok: false,
    });
    vi.spyOn(authSlice, "clearLoginErrors").mockReturnValue({
      type: "auth/clearLoginErrors",
      payload: undefined,
    });

    render(<Login />);

    const closeButton = screen.getByRole("button", { name: /aceptar/i });
    await userEvent.click(closeButton);

    await waitFor(
      () => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: "auth/clearLoginErrors",
          payload: undefined,
        });
      },
      { timeout: 500 },
    );
  });

  it("should dispatch login action with credentials on form submit", async () => {
    mockUseAppSelector.mockReturnValue({
      messages: null,
      inProgress: false,
      ok: false,
    });
    const mockLoginAction = { type: "auth/login" };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(authActions, "login").mockReturnValue(mockLoginAction as any);

    render(<Login />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", {
      name: /iniciar sesión/i,
    });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "Password123!");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(authActions.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123!",
      });
      expect(mockDispatch).toHaveBeenCalledWith(mockLoginAction);
    });
  });

  it("should show loading state in button when login is in progress", () => {
    mockUseAppSelector.mockReturnValue({
      messages: null,
      inProgress: true,
      ok: false,
    });

    render(<Login />);

    expect(
      screen.getByRole("button", { name: /iniciando sesión/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciando sesión/i }),
    ).toBeDisabled();
  });
});
