import type { IRequest } from "./auth";

export interface Warehouse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  use_for_mileage: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WarehouseFormData {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  use_for_mileage: boolean;
}

export type WarehouseInsert = WarehouseFormData
export type WarehouseUpdate = Partial<WarehouseFormData>

export interface WarehousesState {
  warehouses: Warehouse[];
  fetchWarehousesRequest: IRequest;
  createWarehouseRequest: IRequest;
  updateWarehouseRequest: IRequest;
  deleteWarehouseRequest: IRequest;
}
