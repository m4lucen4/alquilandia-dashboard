import { apiClient } from "./api";
import type {
  ExpenseCategory,
  ExpenseCategoryPayload,
  ExpensesCategoriesFilters,
  ExpensesCategoryOptions,
  PaginatedExpensesCategoriesResponse,
} from "@/types/expensesCategories";

const buildFiltersQuery = (filters: ExpensesCategoriesFilters): string => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
};

export const fetchPaginatedExpensesCategories = async (pageSize: number, pageToFetch: number, filters: ExpensesCategoriesFilters): Promise<PaginatedExpensesCategoriesResponse> => {
  const query = new URLSearchParams({ pageSize: String(pageSize), pageToFetch: String(pageToFetch) });
  const filtersQuery = buildFiltersQuery(filters);
  const response = await apiClient(`/expensesCategories/paginated?${query.toString()}${filtersQuery ? `&${filtersQuery}` : ""}`);
  return response.json() as Promise<PaginatedExpensesCategoriesResponse>;
};

export const fetchAllExpensesCategories = async (): Promise<ExpenseCategory[]> => {
  const response = await apiClient("/expensesCategories/");
  return response.json() as Promise<ExpenseCategory[]>;
};

export const fetchExpenseCategoryDetails = async (id: string): Promise<ExpenseCategory> => {
  const response = await apiClient(`/expensesCategories/details/${id}`);
  return response.json() as Promise<ExpenseCategory>;
};

export const fetchExpensesCategoryOptions = async (): Promise<ExpensesCategoryOptions> => {
  const response = await apiClient("/expensesCategories/options");
  return response.json() as Promise<ExpensesCategoryOptions>;
};

export const createExpenseCategory = async (body: ExpenseCategoryPayload): Promise<ExpenseCategory> => {
  const response = await apiClient("/expensesCategories/", { method: "POST", body: JSON.stringify(body) });
  return response.json() as Promise<ExpenseCategory>;
};

export const updateExpenseCategory = async (id: string, body: ExpenseCategoryPayload): Promise<ExpenseCategory> => {
  const response = await apiClient(`/expensesCategories/${id}`, { method: "PUT", body: JSON.stringify(body) });
  return response.json() as Promise<ExpenseCategory>;
};

export const deleteExpenseCategory = async (id: string): Promise<void> => {
  await apiClient(`/expensesCategories/${id}`, { method: "DELETE" });
};
