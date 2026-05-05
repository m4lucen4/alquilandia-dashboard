import type { IRequest } from "./auth";

export interface InventoryCategory {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryCategoryOption {
  _id: string;
  name: string;
}

export interface InventoryCategoryPaginatedResponse {
  docs: InventoryCategory[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

export interface InventoryCategoryFormData {
  name: string;
  description?: string;
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
