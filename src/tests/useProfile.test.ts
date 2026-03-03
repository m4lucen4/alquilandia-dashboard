import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProfile } from "../hooks/useProfile";
import * as hooks from "../redux/hooks";
import * as profileActions from "../redux/actions/profile";
import * as profileSlice from "../redux/slices/profileSlice";

vi.mock("../redux/hooks");
vi.mock("../redux/actions/profile");
vi.mock("../redux/slices/profileSlice");

describe("useProfile", () => {
  const mockDispatch = vi.fn();
  const mockUser = {
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
    company: null,
    blocked: false,
    discount: 0,
    emailHash: "",
    estado: "active",
    password: "",
    registered: "",
    role: "USER",
    FullName: "Juan García",
    googleId: "",
    appleId: "",
    isDeleted: false,
    deletedAt: "",
    problematic: false,
  };

  const mockProfileState = {
    updateProfileRequest: { inProgress: false, messages: "", ok: false },
    changePasswordRequest: { inProgress: false, messages: "", ok: false },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(hooks, "useAppDispatch").mockReturnValue(mockDispatch);
    vi.spyOn(hooks, "useAppSelector").mockImplementation((selector) => {
      const state = {
        auth: { user: mockUser },
        profile: mockProfileState,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return selector(state as any);
    });
  });

  it("should initialize profile data from user", () => {
    const { result } = renderHook(() => useProfile());

    expect(result.current.profileData.firstName).toBe("Juan");
    expect(result.current.profileData.lastName).toBe("García");
    expect(result.current.profileData.email).toBe("juan@test.com");
  });

  it("should initialize password data as empty", () => {
    const { result } = renderHook(() => useProfile());

    expect(result.current.passwordData.currentPassword).toBe("");
    expect(result.current.passwordData.newPassword).toBe("");
    expect(result.current.passwordData.confirmPassword).toBe("");
  });

  it("should update profile data on change", () => {
    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.handleProfileChange({
        target: { name: "firstName", value: "Pedro" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.profileData.firstName).toBe("Pedro");
  });

  it("should update password data on change", () => {
    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.handlePasswordChange({
        target: { name: "currentPassword", value: "mypass123" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.passwordData.currentPassword).toBe("mypass123");
  });

  it("should validate required profile fields", () => {
    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.handleProfileChange({
        target: { name: "firstName", value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.handleProfileSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.profileErrors.firstName).toBe(
      "El nombre es requerido",
    );
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("should dispatch updateProfile on valid profile submit", () => {
    const mockAction = { type: "profile/updateProfile" };
    vi.spyOn(profileActions, "updateProfile").mockReturnValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockAction as any,
    );

    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.handleProfileSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(profileActions.updateProfile).toHaveBeenCalledWith({
      id: "1",
      body: expect.objectContaining({
        firstName: "Juan",
        lastName: "García",
        email: "juan@test.com",
      }),
    });
    expect(mockDispatch).toHaveBeenCalledWith(mockAction);
  });

  it("should return isPasswordFormValid=false when form is empty", () => {
    const { result } = renderHook(() => useProfile());

    expect(result.current.isPasswordFormValid).toBe(false);
  });

  it("should return isPasswordFormValid=false when passwords mismatch", () => {
    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.handlePasswordChange({
        target: { name: "currentPassword", value: "current123" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handlePasswordChange({
        target: { name: "newPassword", value: "newpass123" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handlePasswordChange({
        target: { name: "confirmPassword", value: "different" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.isPasswordFormValid).toBe(false);
  });

  it("should return isPasswordFormValid=false when new password is too short", () => {
    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.handlePasswordChange({
        target: { name: "currentPassword", value: "current123" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handlePasswordChange({
        target: { name: "newPassword", value: "abc" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handlePasswordChange({
        target: { name: "confirmPassword", value: "abc" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.isPasswordFormValid).toBe(false);
  });

  it("should return isPasswordFormValid=true when form is valid", () => {
    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.handlePasswordChange({
        target: { name: "currentPassword", value: "current123" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handlePasswordChange({
        target: { name: "newPassword", value: "newpass123" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handlePasswordChange({
        target: { name: "confirmPassword", value: "newpass123" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.isPasswordFormValid).toBe(true);
  });

  it("should dispatch changePassword when submitPassword is called", () => {
    const mockAction = { type: "profile/changePassword" };
    vi.spyOn(profileActions, "changePassword").mockReturnValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockAction as any,
    );

    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.handlePasswordChange({
        target: { name: "currentPassword", value: "current123" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handlePasswordChange({
        target: { name: "newPassword", value: "newpass123" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handlePasswordChange({
        target: { name: "confirmPassword", value: "newpass123" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.submitPassword();
    });

    expect(profileActions.changePassword).toHaveBeenCalledWith({
      currentPassword: "current123",
      newPassword: "newpass123",
      confirmPassword: "newpass123",
    });
    expect(mockDispatch).toHaveBeenCalledWith(mockAction);
  });

  it("should dispatch both clear actions and reset password data when handleClearAllRequests is called", () => {
    vi.spyOn(profileSlice, "clearUpdateProfileRequest").mockReturnValue({
      type: "profile/clearUpdateProfileRequest",
      payload: undefined,
    });
    vi.spyOn(profileSlice, "clearChangePasswordRequest").mockReturnValue({
      type: "profile/clearChangePasswordRequest",
      payload: undefined,
    });

    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.handlePasswordChange({
        target: { name: "currentPassword", value: "something" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.handleClearAllRequests();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "profile/clearUpdateProfileRequest",
      payload: undefined,
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "profile/clearChangePasswordRequest",
      payload: undefined,
    });
    expect(result.current.passwordData.currentPassword).toBe("");
  });
});
