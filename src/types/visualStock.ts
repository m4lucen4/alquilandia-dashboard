import type { IRequest } from "./auth";
import type { Budget, BudgetLine } from "./budgets";

export interface VisualStockDateRange {
  startDate: string;
  endDate: string;
}

export interface VisualStockProductSource {
  id: string;
  name: string;
  units: number;
  unidades?: number;
  products?: BudgetLine[];
  budgets: Budget[];
}

export interface VisualStockProduct extends VisualStockProductSource {
  unidades: number;
  products: BudgetLine[];
}

export interface VisualStockExtraSource {
  id: string;
  extraName: string;
  units: number;
  budget: Budget;
}

export interface VisualStockExtra {
  id: string;
  extraName: string;
  units: number;
  budgets: Budget[];
}

export interface VisualStockExtraBudget extends Budget {
  extraUnits: number;
}

export interface VisualStockState {
  products: VisualStockProduct[];
  extras: VisualStockExtra[];
  selectedBudget: Budget | null;
  productsRequest: IRequest;
  extrasRequest: IRequest;
  budgetDetailsRequest: IRequest;
  productsRequestId: string | null;
  extrasRequestId: string | null;
  budgetDetailsRequestId: string | null;
}
