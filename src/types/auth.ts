export interface Company {
  name: string;
  nif: string;
  address: string;
  population: string;
  locality: string;
  zipCode: string;
}

export interface IRequest {
  inProgress: boolean;
  messages: string;
  ok: boolean;
}

export interface CurrentUser {
  id: string;
  address: string;
  blocked: boolean;
  discount: number;
  dnif: string;
  email: string;
  emailHash: string;
  estado: string;
  firstName: string;
  lastName: string;
  locality: string;
  password: string;
  phone: string;
  phone2: string;
  population: string;
  registered: string;
  role: string;
  zipCode: string;
  FullName: string;
  googleId: string;
  appleId: string;
  company: Company | null;
  isDeleted: boolean;
  deletedAt: string;
  problematic: boolean;
}

export const platformRoles = ["ADMIN", "TECHNICIAN", "MANAGER"] as const;

export type PlatformRole = (typeof platformRoles)[number];

export const isAllowedPlatformRole = (role: unknown): role is PlatformRole =>
  typeof role === "string" && platformRoles.includes(role as PlatformRole);

export const isAuthorizedPlatformSession = (
  authenticated: boolean,
  user: CurrentUser | null,
): boolean => authenticated && isAllowedPlatformRole(user?.role);

export interface LoginPayload {
    email: string;
    password: string;
  }

export interface LoginResponse {
  token: string;
  currentUser: CurrentUser;
}
