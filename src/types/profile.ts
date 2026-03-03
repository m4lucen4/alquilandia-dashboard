import type { Company, IRequest } from "./auth";

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phone2: string;
  address: string;
  locality: string;
  population: string;
  zipCode: string;
  dnif: string;
  company: Company;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileState {
  updateProfileRequest: IRequest;
  changePasswordRequest: IRequest;
}
