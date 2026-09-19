import type { IRequest } from "./auth";

export interface ExpenseCategory {
  id: string;
  principal: string;
  subcategoria: string;
  iva: number;
}

export type ExpenseCategoryPayload = Omit<ExpenseCategory, "id">;

export interface ExpensesCategoriesFilters {
  principal?: string;
  subcategoria?: string;
  iva?: number;
}

export interface PaginatedExpensesCategoriesResponse {
  expensesCategories: ExpenseCategory[];
  total?: number;
}

export interface ExpensesCategoryOptions {
  principals: string[];
  subcategories: string[];
}

export interface ExpensesCategoriesState {
  expensesCategories: ExpenseCategory[];
  total: number;
  allExpensesCategories: ExpenseCategory[];
  currentExpenseCategory: ExpenseCategory | null;
  options: ExpensesCategoryOptions;
  fetchExpensesCategoriesRequest: IRequest;
  fetchAllExpensesCategoriesRequest: IRequest;
  fetchExpenseCategoryDetailsRequest: IRequest;
  fetchExpensesCategoryOptionsRequest: IRequest;
  createExpenseCategoryRequest: IRequest;
  updateExpenseCategoryRequest: IRequest;
  deleteExpenseCategoryRequest: IRequest;
  latestFetchRequestId?: string;
  latestDetailsRequestId?: string;
}
