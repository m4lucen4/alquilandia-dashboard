import { apiClient } from "./api";
import type {
  BudgetsResponse,
  Budget,
  Receipt,
  UnavailableProduct,
} from "../types/budgets";

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

export interface CreateBudgetParams {
  data: Record<string, unknown>;
  filterQuery?: string;
}

export interface UpdateBudgetParams {
  budgetId: string;
  data: Partial<Budget>;
}

export interface UpdateBudgetTechnicianParams {
  budgetId: string;
  technicianEmailHash: string;
}

export interface CheckoutBudgetParams {
  budgetId: string;
  paymentType: string;
}

export interface GetStripeSecretParams {
  amount: number;
  budgetId: string;
}

export const getBudgetFinalDetails = async (id: string): Promise<Budget> => {
  const response = await apiClient(`/budgets/detailsFinal/${id}`);
  return response.json();
};

export const createBudget = async ({
  data,
  filterQuery = "",
}: CreateBudgetParams): Promise<Budget> => {
  const formData = new FormData();
  formData.append("user", JSON.stringify(data));
  const url = filterQuery
    ? `/budgets/${filterQuery}&isFromWeb=true`
    : `/budgets/?isFromWeb=true`;
  const response = await apiClient(url, { method: "POST", body: formData });
  return response.json();
};

export const createBudgetConfirm = async (
  data: Record<string, unknown>,
): Promise<Budget> => {
  const formData = new FormData();
  formData.append("user", JSON.stringify(data));
  const response = await apiClient("/budgets/?confirmation=true", {
    method: "POST",
    body: formData,
  });
  return response.json();
};

export const updateBudget = async ({
  budgetId,
  data,
}: UpdateBudgetParams): Promise<Budget> => {
  const response = await apiClient(`/budgets/${budgetId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateBudgetTechnician = async ({
  budgetId,
  technicianEmailHash,
}: UpdateBudgetTechnicianParams): Promise<Budget> => {
  const response = await apiClient(
    `/budgets/${budgetId}/technician/${technicianEmailHash}`,
    { method: "POST" },
  );
  return response.json();
};

export const deleteBudget = async (budgetId: string): Promise<void> => {
  await apiClient(`/budgets/${budgetId}`, { method: "DELETE" });
};

export const rejectBudget = async (budgetId: string): Promise<void> => {
  await apiClient(`/budgets/${budgetId}/reject`, { method: "POST" });
};

export const getBudgetReceipts = async (id: string): Promise<Receipt[]> => {
  const response = await apiClient(`/budgets/${id}/receipts`);
  return response.json();
};

export const checkoutBudget = async ({
  budgetId,
  paymentType,
}: CheckoutBudgetParams): Promise<Budget | UnavailableProduct[]> => {
  const response = await apiClient(
    `/budgets/${budgetId}/alquilandiaCheckout?paymentType=${paymentType}`,
    { method: "POST" },
  );
  return response.json();
};

export const getStripeSecret = async ({
  amount,
  budgetId,
}: GetStripeSecretParams): Promise<string | UnavailableProduct[]> => {
  const response = await apiClient(`/budgets/${budgetId}/secret/${amount}`);
  return response.json();
};

export const getStripeFinalSecret = async ({
  amount,
  budgetId,
}: GetStripeSecretParams): Promise<string | UnavailableProduct[]> => {
  const response = await apiClient(
    `/budgets/${budgetId}/finalSecret/${amount}`,
  );
  return response.json();
};
