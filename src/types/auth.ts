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
  company: string | null;
  isDeleted: boolean;
  deletedAt: string;
  problematic: boolean;
}

export interface LoginPayload {
    email: string;
    password: string;
  }

export interface LoginResponse {
  token: string;
  currentUser: CurrentUser;
}
