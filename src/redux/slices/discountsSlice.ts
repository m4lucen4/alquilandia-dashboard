import { createSlice } from "@reduxjs/toolkit";
import { fetchDiscountsThunk } from "../actions/discounts";
import type { DiscountsState } from "@/types/discounts";

const requestIdle = { inProgress: false, messages: "", ok: false };

const initialState: DiscountsState = {
  discounts: [],
  fetchDiscountsRequest: requestIdle,
};

const discountsSlice = createSlice({
  name: "discounts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDiscountsThunk.pending, (state) => {
      state.fetchDiscountsRequest = { inProgress: true, messages: "", ok: false };
    });
    builder.addCase(fetchDiscountsThunk.fulfilled, (state, action) => {
      state.fetchDiscountsRequest = { inProgress: false, messages: "", ok: true };
      state.discounts = action.payload;
    });
    builder.addCase(fetchDiscountsThunk.rejected, (state, action) => {
      state.fetchDiscountsRequest = {
        inProgress: false,
        messages: (action.payload as string) || "Error al obtener los descuentos",
        ok: false,
      };
    });
  },
});

export default discountsSlice.reducer;
