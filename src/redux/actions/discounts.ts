import { createAsyncThunk } from "@reduxjs/toolkit";
import { getDiscounts } from "../../services/discountsService";

export const fetchDiscountsThunk = createAsyncThunk(
  "discounts/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getDiscounts();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al obtener los descuentos";
      return rejectWithValue(errorMessage);
    }
  },
);
