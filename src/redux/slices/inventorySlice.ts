import { createSlice } from "@reduxjs/toolkit";
import {
  createInventoryThunk,
  editInventoryThunk,
  fetchPaginatedInventoryThunk,
  fetchInventoryDetailsThunk,
  deleteInventoryThunk,
  exportInventoryToCSVThunk,
  fetchProductBlocksThunk,
  editWarehouseUnitsThunk,
  editWarehouseWarningLimitThunk,
  transferWarehouseAndInventoryThunk,
} from "../actions/inventory";
import type { InventoryState } from "@/types/inventory";

const requestIdle = { inProgress: false, messages: "", ok: false };

const initialState: InventoryState = {
  inventoryItems: [],
  inventoryTotal: 0,
  inventoryDetails: null,
  productBlocks: [],
  fetchPaginatedInventoryRequest: requestIdle,
  fetchInventoryDetailsRequest: requestIdle,
  fetchProductBlocksRequest: requestIdle,
  createInventoryRequest: requestIdle,
  editInventoryRequest: requestIdle,
  deleteInventoryRequest: requestIdle,
  exportInventoryRequest: requestIdle,
  editWarehouseUnitsRequest: requestIdle,
  editWarehouseWarningLimitRequest: requestIdle,
  transferWarehouseAndInventoryRequest: requestIdle,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    clearInventoryTable: (state) => {
      state.inventoryItems = [];
      state.inventoryTotal = 0;
      state.fetchPaginatedInventoryRequest = requestIdle;
    },
    clearInventoryDetails: (state) => {
      state.inventoryDetails = null;
      state.fetchInventoryDetailsRequest = requestIdle;
    },
    clearCreateInventorySuccess: (state) => {
      state.createInventoryRequest = requestIdle;
    },
    clearEditInventorySuccess: (state) => {
      state.editInventoryRequest = requestIdle;
    },
    clearDeleteInventorySuccess: (state) => {
      state.deleteInventoryRequest = requestIdle;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Paginated
      .addCase(fetchPaginatedInventoryThunk.pending, (state) => {
        state.fetchPaginatedInventoryRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(fetchPaginatedInventoryThunk.fulfilled, (state, action) => {
        state.inventoryItems = action.payload.inventory ?? [];
        state.inventoryTotal = action.payload.totalDocs ?? action.payload.total ?? 0;
        state.fetchPaginatedInventoryRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(fetchPaginatedInventoryThunk.rejected, (state, action) => {
        state.fetchPaginatedInventoryRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al obtener el inventario",
          ok: false,
        };
      })
      // Fetch Details
      .addCase(fetchInventoryDetailsThunk.pending, (state) => {
        state.fetchInventoryDetailsRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(fetchInventoryDetailsThunk.fulfilled, (state, action) => {
        state.inventoryDetails = action.payload;
        state.fetchInventoryDetailsRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(fetchInventoryDetailsThunk.rejected, (state, action) => {
        state.fetchInventoryDetailsRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al obtener los detalles del inventario",
          ok: false,
        };
      })
      // Fetch Product Blocks
      .addCase(fetchProductBlocksThunk.pending, (state) => {
        state.fetchProductBlocksRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(fetchProductBlocksThunk.fulfilled, (state, action) => {
        state.productBlocks = action.payload;
        state.fetchProductBlocksRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(fetchProductBlocksThunk.rejected, (state, action) => {
        state.fetchProductBlocksRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al obtener los bloques de producto",
          ok: false,
        };
      })
      // Create
      .addCase(createInventoryThunk.pending, (state) => {
        state.createInventoryRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(createInventoryThunk.fulfilled, (state) => {
        state.createInventoryRequest = {
          inProgress: false,
          messages: "Inventario creado correctamente",
          ok: true,
        };
      })
      .addCase(createInventoryThunk.rejected, (state, action) => {
        state.createInventoryRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al crear el inventario",
          ok: false,
        };
      })
      // Edit
      .addCase(editInventoryThunk.pending, (state) => {
        state.editInventoryRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(editInventoryThunk.fulfilled, (state) => {
        state.editInventoryRequest = {
          inProgress: false,
          messages: "Inventario editado correctamente",
          ok: true,
        };
      })
      .addCase(editInventoryThunk.rejected, (state, action) => {
        state.editInventoryRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al editar el inventario",
          ok: false,
        };
      })
      // Delete
      .addCase(deleteInventoryThunk.pending, (state) => {
        state.deleteInventoryRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(deleteInventoryThunk.fulfilled, (state, action) => {
        state.inventoryItems = state.inventoryItems.filter(
          (item) => item.id !== action.payload
        );
        state.deleteInventoryRequest = {
          inProgress: false,
          messages: "Inventario eliminado correctamente",
          ok: true,
        };
      })
      .addCase(deleteInventoryThunk.rejected, (state, action) => {
        state.deleteInventoryRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al eliminar el inventario",
          ok: false,
        };
      })
      // Export CSV
      .addCase(exportInventoryToCSVThunk.pending, (state) => {
        state.exportInventoryRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(exportInventoryToCSVThunk.fulfilled, (state) => {
        state.exportInventoryRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(exportInventoryToCSVThunk.rejected, (state, action) => {
        state.exportInventoryRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al exportar el inventario",
          ok: false,
        };
      })
      // Edit Warehouse Units
      .addCase(editWarehouseUnitsThunk.pending, (state) => {
        state.editWarehouseUnitsRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(editWarehouseUnitsThunk.fulfilled, (state) => {
        state.editWarehouseUnitsRequest = {
          inProgress: false,
          messages: "Unidades de almacén actualizadas correctamente",
          ok: true,
        };
      })
      .addCase(editWarehouseUnitsThunk.rejected, (state, action) => {
        state.editWarehouseUnitsRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al editar las unidades de almacén",
          ok: false,
        };
      })
      // Edit Warehouse Warning Limit
      .addCase(editWarehouseWarningLimitThunk.pending, (state) => {
        state.editWarehouseWarningLimitRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(editWarehouseWarningLimitThunk.fulfilled, (state) => {
        state.editWarehouseWarningLimitRequest = {
          inProgress: false,
          messages: "Límite de alerta del almacén actualizado correctamente",
          ok: true,
        };
      })
      .addCase(editWarehouseWarningLimitThunk.rejected, (state, action) => {
        state.editWarehouseWarningLimitRequest = {
          inProgress: false,
          messages:
            (action.payload as string) ||
            "Error al editar el límite de alerta del almacén",
          ok: false,
        };
      })
      // Transfer Warehouse And Inventory
      .addCase(transferWarehouseAndInventoryThunk.pending, (state) => {
        state.transferWarehouseAndInventoryRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(transferWarehouseAndInventoryThunk.fulfilled, (state) => {
        state.transferWarehouseAndInventoryRequest = {
          inProgress: false,
          messages: "Transferencia realizada correctamente",
          ok: true,
        };
      })
      .addCase(transferWarehouseAndInventoryThunk.rejected, (state, action) => {
        state.transferWarehouseAndInventoryRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al transferir unidades",
          ok: false,
        };
      });
  },
});

export const {
  clearInventoryTable,
  clearInventoryDetails,
  clearCreateInventorySuccess,
  clearEditInventorySuccess,
  clearDeleteInventorySuccess,
} = inventorySlice.actions;

export default inventorySlice.reducer;
