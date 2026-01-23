/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { IRequest } from "./auth";

/**
 * Tipos para la gestión de tipos de facturas
 */

export interface InvoicesType {
  id: string;
  invoices: string;
  percentage: number;
  created_at?: string;
  updated_at?: string;
}

export interface InvoicesTypeFormData {
  invoices: string;
  percentage: number;
}

export interface InvoicesTypeInsert extends InvoicesTypeFormData {}

export interface InvoicesTypeUpdate extends Partial<InvoicesTypeFormData> {}

// Redux State
export interface InvoicesTypesState {
  invoicesTypes: InvoicesType[];
  fetchInvoicesTypesRequest: IRequest;
  createInvoicesTypeRequest: IRequest;
  updateInvoicesTypeRequest: IRequest;
  deleteInvoicesTypeRequest: IRequest;
}
