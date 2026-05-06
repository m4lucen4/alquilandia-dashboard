import type { IRequest } from "./auth";

export interface InventoryImage {
  id: string;
  fileName: string;
  fileUri: string;
  fileId: string;
  title: string;
}

export interface InventoryCategoryRef {
  id: string;
  principal: string;
  nombre: string;
}

export interface InventoryExtra {
  id?: string;
  extraName: string;
  price: number;
  checked?: boolean;
  units?: number;
}

export interface PriceException {
  id?: string;
  date: string;
  price: number;
}

export interface Inventory {
  id: string;
  elemento: string;
  categoria: string;
  categoriaObj: InventoryCategoryRef;
  costeTotal: number;
  unidades: number;
  precioUd: number;
  precioCoste: number;
  bloqueo: number;
  private: boolean;
  priceExceptionList: PriceException[];
  extras: InventoryExtra[];
  archivo: InventoryImage[];
  datetime: string;
  observaciones: string;
  objetoid: string;
  units: number;
  warehouseUnits: number;
  warehouseWarningUnitsLimit: number;
  documents: unknown[];
}

export interface InventoryFormData {
  elemento: string;
  categoria: string;
  unidades: number;
  precioUd: number;
  precioCoste: number;
  costeTotal: number;
  private: boolean;
  observaciones?: string;
  images?: File[];
  deletedImageIds?: string[];
  archivo?: InventoryImage[];
  extras?: InventoryExtra[];
  priceExceptionList?: PriceException[];
}

export interface InventoryPaginatedResponse {
  inventory: Inventory[];
  totalDocs?: number;
  total?: number;
  page?: number;
  totalPages?: number;
}

export interface ProductBlock {
  id: string;
  inventoryId: string;
  [key: string]: unknown;
}

export interface FetchPaginatedInventoryParams {
  pageSize: number;
  pageToFetch: number;
  filtersQuery: string;
}

export interface FetchProductBlocksParams {
  id: string;
  queryParams: string;
}

export interface InventoryState {
  inventoryItems: Inventory[];
  inventoryTotal: number;
  inventoryDetails: Inventory | null;
  productBlocks: ProductBlock[];
  fetchPaginatedInventoryRequest: IRequest;
  fetchInventoryDetailsRequest: IRequest;
  fetchProductBlocksRequest: IRequest;
  createInventoryRequest: IRequest;
  editInventoryRequest: IRequest;
  deleteInventoryRequest: IRequest;
  exportInventoryRequest: IRequest;
  editWarehouseUnitsRequest: IRequest;
  editWarehouseWarningLimitRequest: IRequest;
  transferWarehouseAndInventoryRequest: IRequest;
}
