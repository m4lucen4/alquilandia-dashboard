import type { IRequest } from "./auth";

export interface InventoryCategory {
  id: string;
  principal: string;
  nombre: string;
}

export interface InventoryCategoryOption {
  id: string;
  principal: string;
  nombre: string;
}

export interface InventoryCategoryPaginatedResponse {
  docs: InventoryCategory[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

export interface InventoryCategoryFormData {
  principal: string;
  nombre: string;
}

export interface FetchPaginatedInventoryCategoriesParams {
  pageSize: number;
  pageToFetch: number;
  filtersQuery: string;
}

export interface InventoryCategoriesState {
  inventoryCategories: InventoryCategory[];
  inventoryCategoriesTotal: number;
  inventoryCategoriesList: InventoryCategory[];
  inventoryCategoriesOptions: InventoryCategoryOption[];
  inventoryCategoryDetails: InventoryCategory | null;
  fetchPaginatedInventoryCategoriesRequest: IRequest;
  fetchInventoryCategoriesRequest: IRequest;
  fetchInventoryCategoriesOptionsRequest: IRequest;
  fetchInventoryCategoryDetailsRequest: IRequest;
  createInventoryCategoryRequest: IRequest;
  editInventoryCategoryRequest: IRequest;
  deleteInventoryCategoryRequest: IRequest;
}
