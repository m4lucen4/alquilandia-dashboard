import type { IRequest } from "./auth";

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
  createBudgetRequest: IRequest;
}
