import type { IRequest } from "./auth";
import type { Budget, UnavailableProduct } from "./budgets";
import type { Inventory } from "./inventory";

export interface ClientWizardFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phone2?: string;
  dnif: string;
  address?: string;
  population?: string;
  locality?: string;
  zipCode?: string;
  discount: number;
  problematic: boolean;
  company?: {
    name?: string;
    nif?: string;
    address?: string;
    population?: string;
    locality?: string;
    zipCode?: string;
  };
}

export interface BudgetWizardState {
  step: number;
  prefillData: ClientWizardFormData | null;
  budgetId: string | null;
  budget: Budget | null;
  createBudgetRequest: IRequest;
  updateEventDetailsRequest: IRequest;
  catalogProducts: Inventory[];
  catalogTotal: number;
  catalogPage: number;
  catalogFiltersQuery: string;
  stockByProductId: Record<string, number>;
  fetchCatalogRequest: IRequest;
  fetchStockRequest: IRequest;
  updateLinesRequest: IRequest;
  finalizeRequest: IRequest;
  unavailableProducts: UnavailableProduct[];
}
