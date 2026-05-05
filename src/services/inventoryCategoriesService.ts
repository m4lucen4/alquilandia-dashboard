import { apiClient } from "./api";
import type {
  InventoryCategory,
  InventoryCategoryFormData,
  InventoryCategoryOption,
  InventoryCategoryPaginatedResponse,
} from "../types/inventoryCategories";

export const createInventoryCategory = async (
  body: InventoryCategoryFormData
): Promise<InventoryCategory> => {
  const response = await apiClient("/categories/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return response.json();
};

export const editInventoryCategory = async (
  id: string,
  body: InventoryCategoryFormData
): Promise<InventoryCategory> => {
  const response = await apiClient(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return response.json();
};

export const getPaginatedInventoryCategories = async (
  pageSize: number,
  pageToFetch: number,
  filtersQuery: string
): Promise<InventoryCategoryPaginatedResponse> => {
  const response = await apiClient(
    `/categories/paginated?pageSize=${pageSize}&pageToFetch=${pageToFetch}&${filtersQuery}`
  );
  return response.json();
};

export const deleteInventoryCategory = async (id: string): Promise<void> => {
  await apiClient(`/categories/${id}`, { method: "DELETE" });
};

export const getInventoryCategories = async (): Promise<InventoryCategory[]> => {
  const response = await apiClient("/categories/");
  return response.json();
};

export const getInventoryCategoriesOptions = async (): Promise<InventoryCategoryOption[]> => {
  const response = await apiClient("/categories/options");
  return response.json();
};

export const getInventoryCategoryDetails = async (
  id: string
): Promise<InventoryCategory> => {
  const response = await apiClient(`/categories/details/${id}`);
  return response.json();
};
