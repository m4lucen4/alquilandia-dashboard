/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { IRequest } from "./auth";

/**
 * Tipos para la gestión de tipos de impuestos
 */

export interface TaxesType {
  id: string;
  name: string;
  tax: number;
  created_at?: string;
  updated_at?: string;
}

export interface TaxesTypeFormData {
  name: string;
  tax: number;
}

export interface TaxesTypeInsert extends TaxesTypeFormData {}

export interface TaxesTypeUpdate extends Partial<TaxesTypeFormData> {}

// Redux State
export interface TaxesTypesState {
  taxesTypes: TaxesType[];
  fetchTaxesTypesRequest: IRequest;
  createTaxesTypeRequest: IRequest;
  updateTaxesTypeRequest: IRequest;
  deleteTaxesTypeRequest: IRequest;
}
