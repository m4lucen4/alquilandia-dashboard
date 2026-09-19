import type { IRequest } from "./auth";

export interface Expense {
  id: string;
  proveedor: string;
  principal: string;
  secundario: string;
  baseImponible: number;
  impuesto: number;
  total: number;
  fecha: string;
}

export type ExpensePayload = Omit<Expense, "id">;

export interface ExpensesFilters {
  proveedor?: string;
  principal?: string;
  secundario?: string;
  baseImponible?: number;
  impuesto?: number;
  total?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedExpensesResponse {
  expenses: Expense[];
  total?: number;
}

export interface ExportedExpense {
  [key: string]: string | number | undefined;
  Total: string | number;
  "Base Imponible": string | number;
}

export interface ExpensesExportResponse {
  expenses: ExportedExpense[];
  provider: string;
}

export interface ExpensesState {
  expenses: Expense[];
  total: number;
  currentExpense: Expense | null;
  fetchExpensesRequest: IRequest;
  fetchExpenseDetailsRequest: IRequest;
  createExpenseRequest: IRequest;
  updateExpenseRequest: IRequest;
  deleteExpenseRequest: IRequest;
  exportExpensesRequest: IRequest;
  latestFetchRequestId?: string;
  latestDetailsRequestId?: string;
}
