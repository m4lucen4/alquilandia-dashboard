import { apiClient } from "./api";
import type { Discount } from "../types/discounts";

export const getDiscounts = async (): Promise<Discount[]> => {
  const response = await apiClient("/discounts/");
  return response.json();
};
