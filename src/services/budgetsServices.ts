import { apiClient } from "./api";
import type { BudgetsResponse } from "../types/budgets";

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
