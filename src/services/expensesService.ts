import { apiClient } from "./api";
import type {
  Expense,
  ExpensePayload,
  ExpensesExportResponse,
  ExpensesFilters,
  PaginatedExpensesResponse,
} from "@/types/expenses";

const buildFiltersQuery = (filters: ExpensesFilters): string => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
};

export const fetchPaginatedExpenses = async (
  pageSize: number,
  pageToFetch: number,
  filters: ExpensesFilters,
): Promise<PaginatedExpensesResponse> => {
  const query = new URLSearchParams({ pageSize: String(pageSize), pageToFetch: String(pageToFetch) });
  const filtersQuery = buildFiltersQuery(filters);
  const response = await apiClient(`/expenses/paginated?${query.toString()}${filtersQuery ? `&${filtersQuery}` : ""}`);
  return response.json() as Promise<PaginatedExpensesResponse>;
};

export const fetchExpenseDetails = async (id: string): Promise<Expense> => {
  const response = await apiClient(`/expenses/details/${id}`);
  return response.json() as Promise<Expense>;
};

export const createExpense = async (body: ExpensePayload): Promise<Expense> => {
  const response = await apiClient("/expenses/", { method: "POST", body: JSON.stringify(body) });
  return response.json() as Promise<Expense>;
};

export const updateExpense = async (id: string, body: ExpensePayload): Promise<Expense> => {
  const response = await apiClient(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(body) });
  return response.json() as Promise<Expense>;
};

export const deleteExpense = async (id: string): Promise<void> => {
  await apiClient(`/expenses/${id}`, { method: "DELETE" });
};

export const exportExpenses = async (filters: ExpensesFilters): Promise<ExpensesExportResponse> => {
  const response = await apiClient(`/expenses/export?${buildFiltersQuery(filters)}`);
  return response.json() as Promise<ExpensesExportResponse>;
};
