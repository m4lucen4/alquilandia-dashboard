import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getShippingCosts,
  updateShippingCosts as updateShippingCostsService,
} from "@/services/shippingCostsService";
import type { ShippingCostUpdateData } from "@/types/shippingCosts";

export const fetchShippingCosts = createAsyncThunk(
  "shippingCosts/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await getShippingCosts();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener los costes de envío";
      return rejectWithValue(message);
    }
  }
);

export const updateShippingCosts = createAsyncThunk(
  "shippingCosts/update",
  async (
    { id, data }: { id: string; data: ShippingCostUpdateData },
    { rejectWithValue }
  ) => {
    try {
      return await updateShippingCostsService(id, data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al actualizar los costes de envío";
      return rejectWithValue(message);
    }
  }
);
