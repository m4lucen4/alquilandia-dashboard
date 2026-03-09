import { apiClient } from "./api";
import type { BudgetsResponse, Budget } from "../types/budgets";

export interface GetBudgetsParams {
  pageSize: number;
  pageToFetch: number;
  filtersQuery?: string;
}

/**
 * Obtiene los presupuestos paginados y filtrados
 * @param params - Parámetros de paginación y filtros
 * @returns Promise con los datos de respuesta (budgets)
 */
export const getBudgets = async (
  params: GetBudgetsParams,
): Promise<BudgetsResponse> => {
  const { pageSize, pageToFetch, filtersQuery = "" } = params;

  let url = `/budgets/paginated?pageSize=${pageSize}&pageToFetch=${pageToFetch}`;

  if (filtersQuery && filtersQuery.trim() !== "") {
    url += `&${filtersQuery}`;
  }

  const response = await apiClient(url);
  const data: BudgetsResponse = await response.json();
  return data;
};

/**
 * Obtiene un presupuesto por su ID
 * @param budgetId - ID del presupuesto
 * @returns Promise con el presupuesto
 */
export const getBudgetById = async (budgetId: string): Promise<Budget> => {
  const url = `/budgets/details/budgetId/${budgetId}`;
  const response = await apiClient(url);
  const data: Budget = await response.json();
  return data;
};

/**
 * Obtiene un presupuesto por su número de referencia
 * @param budgetReference - Número de referencia del presupuesto
 * @returns Promise con el presupuesto o null si no se encuentra
 */
export const getBudgetByReference = async (
  budgetReference: number,
): Promise<Budget | null> => {
  const url = `/budgets/paginated?pageSize=1&pageToFetch=1&budgetReference=${budgetReference}`;
  const response = await apiClient(url);
  const data: BudgetsResponse = await response.json();
  return data.budgets?.[0] ?? null;
};
