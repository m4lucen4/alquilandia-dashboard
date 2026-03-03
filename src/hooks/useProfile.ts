import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateProfile, changePassword } from "@/redux/actions/profile";
import {
  clearUpdateProfileRequest,
  clearChangePasswordRequest,
} from "@/redux/slices/profileSlice";
import type { ProfileFormData, PasswordFormData } from "@/types/profile";
import type { Company } from "@/types/auth";

const EMPTY_COMPANY: Company = {
  name: "",
  nif: "",
  address: "",
  population: "",
  locality: "",
  zipCode: "",
};

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { updateProfileRequest, changePasswordRequest } = useAppSelector(
    (state) => state.profile,
  );

  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    phone2: user?.phone2 ?? "",
    address: user?.address ?? "",
    locality: user?.locality ?? "",
    population: user?.population ?? "",
    zipCode: user?.zipCode ?? "",
    dnif: user?.dnif ?? "",
    company: user?.company ?? EMPTY_COMPANY,
  });

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileErrors, setProfileErrors] = useState<
    Partial<Record<keyof ProfileFormData, string>>
  >({});

  const [passwordErrors, setPasswordErrors] = useState<
    Partial<Record<keyof PasswordFormData, string>>
  >({});

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name as keyof ProfileFormData]) {
      setProfileErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      company: { ...prev.company, [name]: value },
    }));
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name as keyof PasswordFormData]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateProfile = (): boolean => {
    const errors: Partial<Record<keyof ProfileFormData, string>> = {};

    if (!profileData.firstName.trim()) {
      errors.firstName = "El nombre es requerido";
    }
    if (!profileData.lastName.trim()) {
      errors.lastName = "Los apellidos son requeridos";
    }
    if (!profileData.email.trim()) {
      errors.email = "El correo electrónico es requerido";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isPasswordFormValid =
    passwordData.currentPassword.length > 0 &&
    passwordData.newPassword.length >= 6 &&
    passwordData.newPassword === passwordData.confirmPassword;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateProfile()) return;
    dispatch(updateProfile({ id: user.id, body: profileData }));
  };

  const submitPassword = () => {
    dispatch(changePassword(passwordData));
  };

  const handleClearAllRequests = () => {
    dispatch(clearUpdateProfileRequest());
    dispatch(clearChangePasswordRequest());
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return {
    user,
    profileData,
    passwordData,
    profileErrors,
    passwordErrors,
    updateProfileRequest,
    changePasswordRequest,
    isPasswordFormValid,
    handleProfileChange,
    handleCompanyChange,
    handlePasswordChange,
    handleProfileSubmit,
    submitPassword,
    handleClearAllRequests,
  };
};
