import type { IRequest } from "./auth";
import type { BudgetLine, Price } from "./budgets";

/**
 * Invoice entity from Supabase
 */
export interface Invoice {
  id: string;
  business_id: string;
  invoices_type_id: string;
  taxes_type_id: string;
  budget_reference: number;
  invoice_number: number;
  budgetlines: BudgetLine[];
  price: Price;
  created_at?: string;
  updated_at?: string;
}

/**
 * Data required to create a new invoice
 */
export interface CreateInvoiceData {
  business_id: string;
  invoices_type_id: string;
  taxes_type_id: string;
  budget_reference: number;
  budgetlines: BudgetLine[];
  price: Price;
}

/**
 * Redux state for invoices
 */
export interface InvoicesState {
  createInvoiceRequest: IRequest;
}
