import type { IRequest } from "@/types/auth";
import type { Company } from "@/types/budgets";

export function mapFormCompany(
  company: Partial<Company> | undefined,
): Company | null {
  if (!company || !Object.values(company).some(Boolean)) return null;
  return {
    name: company.name ?? "",
    nif: company.nif ?? "",
    address: company.address ?? "",
    population: company.population ?? "",
    locality: company.locality ?? "",
    zipCode: company.zipCode ?? "",
  };
}

export interface UsersScreenError {
  title: string;
  description: string;
}

interface UsersScreenRequests {
  fetchPaginatedUsersRequest: IRequest;
  sendMassiveEmailRequest: IRequest;
  createUserRequest: IRequest;
  editUserRequest: IRequest;
}

/** Orden de prioridad: el primer request con error activo es el que se muestra. */
const USERS_SCREEN_ERRORS: { key: keyof UsersScreenRequests; title: string }[] = [
  { key: "fetchPaginatedUsersRequest", title: "Error al cargar usuarios" },
  { key: "sendMassiveEmailRequest", title: "Error al enviar el email" },
  { key: "createUserRequest", title: "Error al crear el usuario" },
  { key: "editUserRequest", title: "Error al editar el usuario" },
];

export function getUsersScreenError(
  requests: UsersScreenRequests,
): UsersScreenError | null {
  for (const { key, title } of USERS_SCREEN_ERRORS) {
    const request = requests[key];
    if (request.messages && !request.inProgress && !request.ok) {
      return { title, description: request.messages };
    }
  }
  return null;
}
