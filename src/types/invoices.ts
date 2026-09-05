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
  event_date?: string;
  created_at?: string;
  updated_at?: string;
  client_name?: string;
  client_nif?: string;
  client_email?: string;
  client_address?: string;
  client_locality?: string;
  client_postal_code?: string;
  client_phone?: string;
  additional_data?: string;
  coupon_discount?: number;
  is_corrective?: boolean;
  original_invoice_id?: string;
  corrective_reason?: string;
  business?: {
    id: string;
    name: string;
    nif?: string;
    address?: string;
    locality?: string;
    province?: string;
    phone?: string;
    postal_code?: string;
    additional_data?: string;
    is_default?: boolean;
  };
  invoices_type?: {
    id: string;
    invoices: string;
    percentage: number;
    concept?: string;
    show_budgetlines?: boolean;
  };
  taxes_type?: {
    id: string;
    name: string;
    tax: number;
  };
  original_invoice?: {
    invoice_number: number;
  };
}

/**
 * Invoice data returned by the paginated invoices listing.
 * Full invoice details are loaded only when opening the edit workflow.
 */
export interface InvoiceListItem {
  id: string;
  invoice_number: number;
  budget_reference: number;
  pdf_url?: string;
  created_at?: string;
  client_name?: string;
  is_corrective?: boolean;
  total: number;
  business?: {
    id: string;
    name: string;
    is_default?: boolean;
  };
  invoices_type?: {
    id: string;
    invoices: string;
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
  client_name?: string;
  client_nif?: string;
  client_email?: string;
  client_address?: string;
  client_locality?: string;
  client_postal_code?: string;
  client_phone?: string;
  additional_data?: string;
  coupon_discount?: number;
  event_date?: string;
  created_at?: string;
}

/**
 * Data required to update an existing invoice
 */
export interface UpdateInvoiceData {
  business_id: string;
  invoices_type_id: string;
  taxes_type_id: string;
  budgetlines: BudgetLine[];
  price: Price;
  client_name?: string;
  client_nif?: string;
  client_email?: string;
  client_address?: string;
  client_locality?: string;
  client_postal_code?: string;
  client_phone?: string;
  additional_data?: string;
  coupon_discount?: number;
  created_at?: string;
  event_date?: string | null;
}

/**
 * Data required to create a corrective invoice
 */
export interface CreateCorrectiveInvoiceData {
  original_invoice_id: string;
  corrective_reason?: string;
}

/**
 * Redux state for invoices
 */
export interface InvoicesState {
  invoices: InvoiceListItem[];
  total: number;
  fetchInvoicesRequest: IRequest;
  createInvoiceRequest: IRequest;
  createCorrectiveInvoiceRequest: IRequest;
  updateInvoiceRequest: IRequest;
}
