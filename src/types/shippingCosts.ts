import type { IRequest } from "./auth";

export interface ShippingCost {
  _id: string;
  fixedPriceBlockZero: number;
  fixedPriceBlockNotZero: number;
  distanceVarBlockZero: number;
  distanceVarBlockNotZero: number;
}

export interface ShippingCostUpdateData {
  fixedPriceBlockZero: number;
  fixedPriceBlockNotZero: number;
  distanceVarBlockZero: number;
  distanceVarBlockNotZero: number;
}

export interface ShippingCostsState {
  shippingCosts: ShippingCost | null;
  fetchShippingCostsRequest: IRequest;
  updateShippingCostsRequest: IRequest;
}
