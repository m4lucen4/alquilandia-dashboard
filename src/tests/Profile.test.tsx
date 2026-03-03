import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Profile } from "../pages/Profile";
import * as useProfileHook from "../hooks/useProfile";

vi.mock("../hooks/useProfile");

const EMPTY_COMPANY = {
  name: "",
  nif: "",
  address: "",
  population: "",
  locality: "",
  zipCode: "",
};

const defaultMockReturn = {
  user: {
    id: "1",
    firstName: "Juan",
    lastName: "García",
    email: "juan@test.com",
    phone: "600000000",
    phone2: "",
    address: "Calle Test 1",
    locality: "Madrid",
    population: "Madrid",
    zipCode: "28001",
    dnif: "",
    company: EMPTY_COMPANY,
  },
  profileData: {
    firstName: "Juan",
    lastName: "García",
    email: "juan@test.com",
    phone: "600000000",
    phone2: "",
    address: "Calle Test 1",
    locality: "Madrid",
    population: "Madrid",
    zipCode: "28001",
    dnif: "",
    company: EMPTY_COMPANY,
  },
  passwordData: {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  },
  profileErrors: {},
  passwordErrors: {},
  isPasswordFormValid: false,
  updateProfileRequest: { inProgress: false, messages: "", ok: false },
  changePasswordRequest: { inProgress: false, messages: "", ok: false },
  handleProfileChange: vi.fn(),
  handleCompanyChange: vi.fn(),
  handlePasswordChange: vi.fn(),
  handleProfileSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
  submitPassword: vi.fn(),
  handleClearAllRequests: vi.fn(),
};

describe("Profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useProfileHook, "useProfile").mockReturnValue(defaultMockReturn);
  });

  it("should render profile page with header", () => {
    render(<Profile />);

    expect(screen.getByText("Mi perfil")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Gestiona tus datos personales, de facturación y tu contraseña.",
      ),
    ).toBeInTheDocument();
  });

  it("should render 'Cambiar contraseña' button in header", () => {
    render(<Profile />);

    expect(
      screen.getByRole("button", { name: /cambiar contraseña/i }),
    ).toBeInTheDocument();
  });

  it("should open password modal when clicking the button", async () => {
    render(<Profile />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /cambiar contraseña/i }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña actual/i)).toBeInTheDocument();
  });

  it("should render profile form fields", () => {
    render(<Profile />);

    expect(document.getElementById("input-firstName")).toBeInTheDocument();
    expect(screen.getByLabelText(/apellidos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
  });

  it("should render billing section", () => {
    render(<Profile />);

    expect(screen.getByText("Datos de facturación")).toBeInTheDocument();
    expect(screen.getByLabelText(/cif\/nif/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre empresa/i)).toBeInTheDocument();
  });

  it("should disable modal accept button when form is invalid", async () => {
    render(<Profile />);

    await userEvent.click(
      screen.getByRole("button", { name: /cambiar contraseña/i }),
    );

    const dialog = screen.getByRole("dialog");
    const acceptButton = within(dialog).getByRole("button", {
      name: /cambiar contraseña/i,
    });
    expect(acceptButton).toBeDisabled();
  });

  it("should enable modal accept button when form is valid", async () => {
    vi.spyOn(useProfileHook, "useProfile").mockReturnValue({
      ...defaultMockReturn,
      isPasswordFormValid: true,
    });

    render(<Profile />);

    await userEvent.click(
      screen.getByRole("button", { name: /cambiar contraseña/i }),
    );

    const dialog = screen.getByRole("dialog");
    const acceptButton = within(dialog).getByRole("button", {
      name: /cambiar contraseña/i,
    });
    expect(acceptButton).not.toBeDisabled();
  });

  it("should show success alert when profile is updated", () => {
    vi.spyOn(useProfileHook, "useProfile").mockReturnValue({
      ...defaultMockReturn,
      updateProfileRequest: { inProgress: false, messages: "", ok: true },
    });

    render(<Profile />);

    expect(
      screen.getByText("Acción realizada correctamente"),
    ).toBeInTheDocument();
  });

  it("should show error alert when profile update fails", () => {
    vi.spyOn(useProfileHook, "useProfile").mockReturnValue({
      ...defaultMockReturn,
      updateProfileRequest: {
        inProgress: false,
        messages: "Error del servidor",
        ok: false,
      },
    });

    render(<Profile />);

    expect(
      screen.getByText("Se ha producido un error al realizar la solicitud"),
    ).toBeInTheDocument();
  });

  it("should show error alert when password change fails", () => {
    vi.spyOn(useProfileHook, "useProfile").mockReturnValue({
      ...defaultMockReturn,
      changePasswordRequest: {
        inProgress: false,
        messages: "Contraseña incorrecta",
        ok: false,
      },
    });

    render(<Profile />);

    expect(
      screen.getByText("Se ha producido un error al realizar la solicitud"),
    ).toBeInTheDocument();
  });

  it("should call handleProfileSubmit when profile form is submitted", async () => {
    render(<Profile />);

    const saveButton = screen.getByRole("button", {
      name: /guardar cambios/i,
    });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(defaultMockReturn.handleProfileSubmit).toHaveBeenCalled();
    });
  });

  it("should call submitPassword when modal accept is clicked", async () => {
    vi.spyOn(useProfileHook, "useProfile").mockReturnValue({
      ...defaultMockReturn,
      isPasswordFormValid: true,
    });

    render(<Profile />);

    await userEvent.click(
      screen.getByRole("button", { name: /cambiar contraseña/i }),
    );

    const dialog = screen.getByRole("dialog");
    const acceptButton = within(dialog).getByRole("button", {
      name: /cambiar contraseña/i,
    });
    await userEvent.click(acceptButton);

    await waitFor(() => {
      expect(defaultMockReturn.submitPassword).toHaveBeenCalled();
    });
  });
});
