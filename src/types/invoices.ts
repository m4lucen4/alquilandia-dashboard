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
  pdf_url?: string;
  created_at?: string;
  updated_at?: string;
  business?: {
    id: string;
    name: string;
    nif?: string;
    address?: string;
    locality?: string;
    province?: string;
    phone?: string;
    postal_code?: string;
  };
  invoices_type?: {
    id: string;
    invoices: string;
    percentage: number;
  };
  taxes_type?: {
    id: string;
    name: string;
    tax: number;
  };
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
  invoices: Invoice[];
  fetchInvoicesRequest: IRequest;
  createInvoiceRequest: IRequest;
}
