import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAllBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from "../actions/business";
import type { BusinessState } from "@/types/business";

const initialState: BusinessState = {
  businesses: [],
  fetchBusinessRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
  createBusinessRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
  updateBusinessRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
  deleteBusinessRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
};

const businessSlice = createSlice({
  name: "business",
  initialState,
  reducers: {
    clearBusinessErrors: (state) => {
      state.fetchBusinessRequest = initialState.fetchBusinessRequest;
      state.createBusinessRequest = initialState.createBusinessRequest;
      state.updateBusinessRequest = initialState.updateBusinessRequest;
      state.deleteBusinessRequest = initialState.deleteBusinessRequest;
    },
    clearCreateBusinessSuccess: (state) => {
      state.createBusinessRequest = initialState.createBusinessRequest;
    },
    clearUpdateBusinessSuccess: (state) => {
      state.updateBusinessRequest = initialState.updateBusinessRequest;
    },
    clearDeleteBusinessSuccess: (state) => {
      state.deleteBusinessRequest = initialState.deleteBusinessRequest;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Business
      .addCase(fetchAllBusiness.pending, (state) => {
        state.fetchBusinessRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(fetchAllBusiness.fulfilled, (state, action) => {
        state.businesses = action.payload;
        state.fetchBusinessRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(fetchAllBusiness.rejected, (state, action) => {
        state.fetchBusinessRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al obtener empresas",
          ok: false,
        };
      })
      // Create Business
      .addCase(createBusiness.pending, (state) => {
        state.createBusinessRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(createBusiness.fulfilled, (state, action) => {
        state.businesses.unshift(action.payload); // Agregar al inicio
        state.createBusinessRequest = {
          inProgress: false,
          messages: "Empresa creada correctamente",
          ok: true,
        };
      })
      .addCase(createBusiness.rejected, (state, action) => {
        state.createBusinessRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al crear empresa",
          ok: false,
        };
      })
      // Update Business
      .addCase(updateBusiness.pending, (state) => {
        state.updateBusinessRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(updateBusiness.fulfilled, (state, action) => {
        const index = state.businesses.findIndex(
          (b) => b.id === action.payload.id
        );
        if (index !== -1) {
          state.businesses[index] = action.payload;
        }
        state.updateBusinessRequest = {
          inProgress: false,
          messages: "Empresa actualizada correctamente",
          ok: true,
        };
      })
      .addCase(updateBusiness.rejected, (state, action) => {
        state.updateBusinessRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al actualizar empresa",
          ok: false,
        };
      })
      // Delete Business
      .addCase(deleteBusiness.pending, (state) => {
        state.deleteBusinessRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(deleteBusiness.fulfilled, (state, action) => {
        state.businesses = state.businesses.filter(
          (b) => b.id !== action.payload
        );
        state.deleteBusinessRequest = {
          inProgress: false,
          messages: "Empresa eliminada correctamente",
          ok: true,
        };
      })
      .addCase(deleteBusiness.rejected, (state, action) => {
        state.deleteBusinessRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al eliminar empresa",
          ok: false,
        };
      });
  },
});

export const {
  clearBusinessErrors,
  clearCreateBusinessSuccess,
  clearUpdateBusinessSuccess,
  clearDeleteBusinessSuccess,
} = businessSlice.actions;

export default businessSlice.reducer;
