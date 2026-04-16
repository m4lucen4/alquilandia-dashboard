import { apiClient } from "./api";
import type { User } from "../types/budgets";

/**
 * Obtiene los detalles de un usuario por su ID
 * @param id - ID del usuario
 * @returns Promise con los datos del usuario
 */
export const getUserDetails = async (id: string): Promise<User> => {
  const response = await apiClient(`/users/details/${id}`);
  const data: User = await response.json();
  return data;
};
