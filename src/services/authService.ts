import { apiClient } from "./api";
import type { LoginPayload, LoginResponse } from "../types/auth";

/**
 * Realiza el login del usuario
 * @param payload - Credenciales de login (email y password)
 * @returns Promise con los datos de respuesta (token y currentUser)
 * @throws Error si las credenciales son inválidas o hay un error en la petición
 */
export const loginUser = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const response = await apiClient("/authenticate", {
    method: "POST",
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data: LoginResponse = await response.json();

  // Redux-persist se encargará de guardar el estado automáticamente
  return data;
};

/**
 * Realiza el logout del usuario
 * Redux-persist se encargará de limpiar el estado automáticamente
 */
export const logoutUser = async (): Promise<void> => {
  // La limpieza se hace a través de Redux
};

/**
 * Solicita un cambio de contraseña para el usuario
 * @param email - Email del usuario que solicita el cambio de contraseña
 * @returns Promise con los datos de respuesta
 * @throws Error si hay un error en la petición
 */
export const requestPasswordChange = async (email: string): Promise<void> => {
  const response = await apiClient(`/users/changePassword?email=${email}`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al solicitar el cambio de contraseña");
  }
};
