/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { IRequest } from "./auth";

/**
 * Tipos para la gestión de datos fiscales de empresas
 */

export interface Business {
  id: string;
  name: string;
  nif: string;
  address: string;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessFormData {
  name: string;
  nif: string;
  address: string;
}

export interface BusinessInsert extends BusinessFormData {}

export interface BusinessUpdate extends Partial<BusinessFormData> {}

// Redux State
export interface BusinessState {
  businesses: Business[];
  fetchBusinessRequest: IRequest;
  createBusinessRequest: IRequest;
  updateBusinessRequest: IRequest;
  deleteBusinessRequest: IRequest;
}
