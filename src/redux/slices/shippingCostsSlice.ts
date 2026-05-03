import { createSlice } from "@reduxjs/toolkit";
import { fetchShippingCosts, updateShippingCosts } from "../actions/shippingCosts";
import type { ShippingCostsState } from "@/types/shippingCosts";

const requestIdle = { inProgress: false, messages: "", ok: false };

const initialState: ShippingCostsState = {
  shippingCosts: null,
  fetchShippingCostsRequest: requestIdle,
  updateShippingCostsRequest: requestIdle,
};

const shippingCostsSlice = createSlice({
  name: "shippingCosts",
  initialState,
  reducers: {
    clearUpdateShippingCostsSuccess: (state) => {
      state.updateShippingCostsRequest = requestIdle;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchShippingCosts.pending, (state) => {
        state.fetchShippingCostsRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(fetchShippingCosts.fulfilled, (state, action) => {
        state.shippingCosts = action.payload;
        state.fetchShippingCostsRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(fetchShippingCosts.rejected, (state, action) => {
        state.fetchShippingCostsRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al obtener los costes de envío",
          ok: false,
        };
      })
      // Update
      .addCase(updateShippingCosts.pending, (state) => {
        state.updateShippingCostsRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(updateShippingCosts.fulfilled, (state, action) => {
        state.shippingCosts = action.payload;
        state.updateShippingCostsRequest = {
          inProgress: false,
          messages: "Costes de envío actualizados correctamente",
          ok: true,
        };
      })
      .addCase(updateShippingCosts.rejected, (state, action) => {
        state.updateShippingCostsRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al actualizar los costes de envío",
          ok: false,
        };
      });
  },
});

export const { clearUpdateShippingCostsSuccess } = shippingCostsSlice.actions;

export default shippingCostsSlice.reducer;
