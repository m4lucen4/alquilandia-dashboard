import { baseURL } from "../constants";

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

/**
 * Obtiene el token de autenticación desde redux-persist
 * Redux-persist guarda el estado en localStorage con la clave 'persist:auth'
 */
export const getAuthToken = (): string | null => {
  try {
    const persistedState = localStorage.getItem("persist:auth");
    if (persistedState) {
      const parsed = JSON.parse(persistedState);

      if (parsed.token) {
        const token = JSON.parse(parsed.token);
        return token;
      }
    }
  } catch (error) {
    console.error("Error al obtener el token:", error);
  }
  return null;
};

/**
 * Configura los headers por defecto para las peticiones
 * Omite Content-Type cuando el body es FormData para que el browser añada el boundary
 */
const getDefaultHeaders = (body?: RequestInit["body"]): HeadersInit => {
  const headers: HeadersInit = {};

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = token;
  }

  return headers;
};

/**
 * Maneja errores de la API de forma centralizada
 */
const handleApiError = async (response: Response): Promise<never> => {
  // Token expirado o sesión inválida: limpiar estado persistido y redirigir a login
  if (response.status === 401) {
    localStorage.removeItem("persist:auth");
    window.location.replace("/login");
  }

  let errorData: unknown;

  try {
    errorData = await response.json();
  } catch {
    errorData = { message: response.statusText || "Error desconocido" };
  }

  const error: ApiError = {
    message: "Error en la petición",
    status: response.status,
    data: errorData,
  };

  throw error;
};

/**
 * Cliente fetch configurado con baseURL y manejo de errores
 */
export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  const url = `${baseURL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      ...getDefaultHeaders(options.body),
      ...options.headers,
    },
    credentials: options.credentials || "include",
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    await handleApiError(response);
  }

  return response;
};
