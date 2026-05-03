import { apiClient } from "./api";
import type { ShippingCost, ShippingCostUpdateData } from "../types/shippingCosts";

export const getShippingCosts = async (): Promise<ShippingCost> => {
  const response = await apiClient("/shippingCosts/");
  const data: ShippingCost = await response.json();
  return data;
};

export const updateShippingCosts = async (
  id: string,
  payload: ShippingCostUpdateData
): Promise<ShippingCost> => {
  const response = await apiClient(`/shippingCosts/${id}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data: ShippingCost = await response.json();
  return data;
};
