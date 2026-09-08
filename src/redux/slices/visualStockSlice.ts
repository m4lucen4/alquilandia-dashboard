import { createSlice } from "@reduxjs/toolkit";
import {
  fetchVisualStockBudgetDetailsThunk,
  fetchVisualStockExtrasThunk,
  fetchVisualStockProductsThunk,
} from "@/redux/actions/visualStock";
import { aggregateVisualStockExtras, aggregateVisualStockProducts } from "@/helpers/visualStock";
import type { VisualStockState } from "@/types/visualStock";

const requestIdle = { inProgress: false, messages: "", ok: false };

const initialState: VisualStockState = {
  products: [],
  extras: [],
  selectedBudget: null,
  productsRequest: requestIdle,
  extrasRequest: requestIdle,
  budgetDetailsRequest: requestIdle,
  productsRequestId: null,
  extrasRequestId: null,
  budgetDetailsRequestId: null,
};

const visualStockSlice = createSlice({
  name: "visualStock",
  initialState,
  reducers: {
    clearVisualStockBudgetDetails: (state) => {
      state.selectedBudget = null;
      state.budgetDetailsRequest = requestIdle;
      state.budgetDetailsRequestId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisualStockProductsThunk.pending, (state, action) => {
        state.productsRequest = { inProgress: true, messages: "", ok: false };
        state.productsRequestId = action.meta.requestId;
      })
      .addCase(fetchVisualStockProductsThunk.fulfilled, (state, action) => {
        if (state.productsRequestId !== action.meta.requestId) return;
        state.products = aggregateVisualStockProducts(action.payload);
        state.productsRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(fetchVisualStockProductsThunk.rejected, (state, action) => {
        if (state.productsRequestId !== action.meta.requestId) return;
        state.productsRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al obtener el stock de productos",
          ok: false,
        };
      })
      .addCase(fetchVisualStockExtrasThunk.pending, (state, action) => {
        state.extrasRequest = { inProgress: true, messages: "", ok: false };
        state.extrasRequestId = action.meta.requestId;
      })
      .addCase(fetchVisualStockExtrasThunk.fulfilled, (state, action) => {
        if (state.extrasRequestId !== action.meta.requestId) return;
        state.extras = aggregateVisualStockExtras(action.payload);
        state.extrasRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(fetchVisualStockExtrasThunk.rejected, (state, action) => {
        if (state.extrasRequestId !== action.meta.requestId) return;
        state.extrasRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al obtener el stock de extras",
          ok: false,
        };
      })
      .addCase(fetchVisualStockBudgetDetailsThunk.pending, (state, action) => {
        state.selectedBudget = null;
        state.budgetDetailsRequest = { inProgress: true, messages: "", ok: false };
        state.budgetDetailsRequestId = action.meta.requestId;
      })
      .addCase(fetchVisualStockBudgetDetailsThunk.fulfilled, (state, action) => {
        if (state.budgetDetailsRequestId !== action.meta.requestId) return;
        state.selectedBudget = action.payload;
        state.budgetDetailsRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(fetchVisualStockBudgetDetailsThunk.rejected, (state, action) => {
        if (state.budgetDetailsRequestId !== action.meta.requestId) return;
        state.budgetDetailsRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al obtener el detalle del presupuesto",
          ok: false,
        };
      });
  },
});

export const { clearVisualStockBudgetDetails } = visualStockSlice.actions;
export default visualStockSlice.reducer;
