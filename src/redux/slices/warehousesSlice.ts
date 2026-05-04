import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAllWarehouses,
  createWarehouseThunk,
  updateWarehouseThunk,
  deleteWarehouseThunk,
} from "../actions/warehouses";
import type { WarehousesState } from "@/types/warehouses";

const requestIdle = { inProgress: false, messages: "", ok: false };

const initialState: WarehousesState = {
  warehouses: [],
  fetchWarehousesRequest: requestIdle,
  createWarehouseRequest: requestIdle,
  updateWarehouseRequest: requestIdle,
  deleteWarehouseRequest: requestIdle,
};

const warehousesSlice = createSlice({
  name: "warehouses",
  initialState,
  reducers: {
    clearWarehousesErrors: (state) => {
      state.fetchWarehousesRequest = requestIdle;
      state.createWarehouseRequest = requestIdle;
      state.updateWarehouseRequest = requestIdle;
      state.deleteWarehouseRequest = requestIdle;
    },
    clearCreateWarehouseSuccess: (state) => {
      state.createWarehouseRequest = requestIdle;
    },
    clearUpdateWarehouseSuccess: (state) => {
      state.updateWarehouseRequest = requestIdle;
    },
    clearDeleteWarehouseSuccess: (state) => {
      state.deleteWarehouseRequest = requestIdle;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllWarehouses.pending, (state) => {
        state.fetchWarehousesRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(fetchAllWarehouses.fulfilled, (state, action) => {
        state.warehouses = action.payload;
        state.fetchWarehousesRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(fetchAllWarehouses.rejected, (state, action) => {
        state.fetchWarehousesRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al obtener los almacenes",
          ok: false,
        };
      })
      // Create
      .addCase(createWarehouseThunk.pending, (state) => {
        state.createWarehouseRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(createWarehouseThunk.fulfilled, (state, action) => {
        state.warehouses.push(action.payload);
        state.createWarehouseRequest = {
          inProgress: false,
          messages: "Almacén creado correctamente",
          ok: true,
        };
      })
      .addCase(createWarehouseThunk.rejected, (state, action) => {
        state.createWarehouseRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al crear el almacén",
          ok: false,
        };
      })
      // Update
      .addCase(updateWarehouseThunk.pending, (state) => {
        state.updateWarehouseRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(updateWarehouseThunk.fulfilled, (state, action) => {
        const index = state.warehouses.findIndex((w) => w.id === action.payload.id);
        if (index !== -1) state.warehouses[index] = action.payload;
        state.updateWarehouseRequest = {
          inProgress: false,
          messages: "Almacén actualizado correctamente",
          ok: true,
        };
      })
      .addCase(updateWarehouseThunk.rejected, (state, action) => {
        state.updateWarehouseRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al actualizar el almacén",
          ok: false,
        };
      })
      // Delete
      .addCase(deleteWarehouseThunk.pending, (state) => {
        state.deleteWarehouseRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(deleteWarehouseThunk.fulfilled, (state, action) => {
        state.warehouses = state.warehouses.filter((w) => w.id !== action.payload);
        state.deleteWarehouseRequest = {
          inProgress: false,
          messages: "Almacén eliminado correctamente",
          ok: true,
        };
      })
      .addCase(deleteWarehouseThunk.rejected, (state, action) => {
        state.deleteWarehouseRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al eliminar el almacén",
          ok: false,
        };
      });
  },
});

export const {
  clearWarehousesErrors,
  clearCreateWarehouseSuccess,
  clearUpdateWarehouseSuccess,
  clearDeleteWarehouseSuccess,
} = warehousesSlice.actions;

export default warehousesSlice.reducer;
