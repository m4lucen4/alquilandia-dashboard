import { apiClient } from "./api";
import type {
  Inventory,
  InventoryFormData,
  InventoryPaginatedResponse,
  ProductBlock,
} from "../types/inventory";

export const createInventory = async (data: InventoryFormData): Promise<Inventory> => {
  const { images, ...rest } = data;
  const body = new FormData();
  if (images && images.length > 0) {
    images.forEach((image) => {
      if (image) body.append("image[]", image);
    });
  }
  body.append("inventory", JSON.stringify(rest));
  const response = await apiClient("/inventory/", { method: "POST", body });
  return response.json();
};

export const editInventory = async (
  id: string,
  data: InventoryFormData
): Promise<Inventory> => {
  const { images, deletedImageIds, ...rest } = data;
  const body = new FormData();
  if (images && images.length > 0) {
    images.forEach((image) => {
      if (image) body.append("image[]", image);
    });
  }
  body.append("inventory", JSON.stringify({ ...rest, deletedImageIds }));
  const response = await apiClient(`/inventory/${id}`, { method: "PUT", body });
  return response.json();
};

export const getPaginatedInventory = async (
  pageSize: number,
  pageToFetch: number,
  filtersQuery: string
): Promise<InventoryPaginatedResponse> => {
  const response = await apiClient(
    `/inventory/paginated?pageSize=${pageSize}&pageToFetch=${pageToFetch}&${filtersQuery}`
  );
  return response.json();
};

export const getInventoryDetails = async (id: string): Promise<Inventory> => {
  const response = await apiClient(`/inventory/details/${id}`);
  return response.json();
};

export const deleteInventory = async (id: string): Promise<void> => {
  await apiClient(`/inventory/${id}`, { method: "DELETE" });
};

export const exportInventoryToCSV = async (filtersQuery: string): Promise<string> => {
  const response = await apiClient(`/inventory/export?${filtersQuery}`);
  return response.json();
};

export const getProductBlocks = async (
  id: string,
  queryParams: string
): Promise<ProductBlock[]> => {
  const response = await apiClient(`/inventory/${id}/stock?${queryParams}`);
  return response.json();
};

export const editWarehouseUnits = async (id: string, units: number): Promise<void> => {
  await apiClient(`/inventory/${id}/warehouseUnits`, {
    method: "PUT",
    body: JSON.stringify({ units }),
  });
};

export const editWarehouseWarningLimitUnits = async (
  id: string,
  units: number
): Promise<void> => {
  await apiClient(`/inventory/${id}/warehouseWarningLimit`, {
    method: "PUT",
    body: JSON.stringify({ units }),
  });
};

export const transferWarehouseAndInventory = async (
  id: string,
  unitsToTransfer: number,
  fromWarehouseToInventory = false
): Promise<void> => {
  await apiClient(`/inventory/${id}/transferWarehouseAndInventory`, {
    method: "PUT",
    body: JSON.stringify({ unitsToTransfer, fromWarehouseToInventory }),
  });
};
