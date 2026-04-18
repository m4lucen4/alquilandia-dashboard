import { apiClient } from "./api";
import type { User, Budget } from "../types/budgets";

export interface UsersResponse {
  users: User[];
  total?: number;
}

export interface GetPaginatedUsersParams {
  pageSize: number;
  pageToFetch: number;
  filtersQuery?: string;
}

export interface MassiveEmailData {
  subject: string;
  body: string;
  image?: File;
  [key: string]: unknown;
}

export const getUserDetails = async (id: string): Promise<User> => {
  const response = await apiClient(`/users/details/${id}`);
  return response.json();
};

export const createUser = async (body: Partial<User>): Promise<User> => {
  const response = await apiClient("/users/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return response.json();
};

export const editUser = async (
  id: string,
  body: Partial<User>,
): Promise<User> => {
  const response = await apiClient(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return response.json();
};

export const editUserProfile = async (
  id: string,
  body: Partial<User>,
): Promise<User> => {
  const response = await apiClient(`/users/${id}/profile`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return response.json();
};

export const fetchPaginatedUsers = async (
  params: GetPaginatedUsersParams,
): Promise<UsersResponse> => {
  const { pageSize, pageToFetch, filtersQuery = "" } = params;
  let url = `/users/paginated?pageSize=${pageSize}&pageToFetch=${pageToFetch}`;
  if (filtersQuery && filtersQuery.trim() !== "") {
    url += `&${filtersQuery}`;
  }
  const response = await apiClient(url);
  return response.json();
};

export const getAdminAndTechnicians = async (): Promise<User[]> => {
  const response = await apiClient("/users/adminAndTechnicians");
  return response.json();
};

export const fetchUserDetailsByEmailHash = async (
  emailHash: string,
): Promise<User> => {
  const response = await apiClient(`/users/${emailHash}`);
  return response.json();
};

export const blockUser = async (id: string): Promise<User> => {
  const response = await apiClient(`/users/${id}/block`, { method: "PUT" });
  return response.json();
};

export const unblockUser = async (id: string): Promise<User> => {
  const response = await apiClient(`/users/${id}/unblock`, { method: "PUT" });
  return response.json();
};

export const deleteUser = async (id: string): Promise<User> => {
  const response = await apiClient(`/users/${id}/delete`, { method: "PUT" });
  return response.json();
};

export const generateBudgetById = async (userId: string): Promise<Budget> => {
  const response = await apiClient(`/users/${userId}/generateBudget`, {
    method: "POST",
  });
  return response.json();
};

export const sendMassiveEmail = async (
  data: MassiveEmailData,
): Promise<void> => {
  const { image, ...rest } = data;
  const formData = new FormData();
  formData.append("massiveEmail", JSON.stringify(rest));
  if (image) {
    formData.append("image", image);
  }
  await apiClient("/users/sendMail", {
    method: "POST",
    body: formData,
  });
};

export const fetchUsersByPhone = async (
  phone: string,
): Promise<UsersResponse> => {
  const response = await apiClient(
    `/users/paginated?pageSize=0&pageToFetch=0&phone=${phone}`,
  );
  return response.json();
};
