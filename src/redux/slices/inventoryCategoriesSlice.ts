import { createSlice } from "@reduxjs/toolkit";
import {
  createInventoryCategoryThunk,
  editInventoryCategoryThunk,
  fetchPaginatedInventoryCategories,
  deleteInventoryCategoryThunk,
  fetchInventoryCategories,
  fetchInventoryCategoriesOptions,
  fetchInventoryCategoryDetails,
} from "../actions/inventoryCategories";
import type { InventoryCategoriesState } from "@/types/inventoryCategories";

const requestIdle = { inProgress: false, messages: "", ok: false };

const initialState: InventoryCategoriesState = {
  inventoryCategories: [],
  inventoryCategoriesTotal: 0,
  inventoryCategoriesList: [],
  inventoryCategoriesOptions: [],
  inventoryCategoryDetails: null,
  fetchPaginatedInventoryCategoriesRequest: requestIdle,
  fetchInventoryCategoriesRequest: requestIdle,
  fetchInventoryCategoriesOptionsRequest: requestIdle,
  fetchInventoryCategoryDetailsRequest: requestIdle,
  createInventoryCategoryRequest: requestIdle,
  editInventoryCategoryRequest: requestIdle,
  deleteInventoryCategoryRequest: requestIdle,
};

const inventoryCategoriesSlice = createSlice({
  name: "inventoryCategories",
  initialState,
  reducers: {
    clearInventoryCategoriesTable: (state) => {
      state.inventoryCategories = [];
      state.inventoryCategoriesTotal = 0;
      state.fetchPaginatedInventoryCategoriesRequest = requestIdle;
    },
    clearInventoryCategoryDetails: (state) => {
      state.inventoryCategoryDetails = null;
      state.fetchInventoryCategoryDetailsRequest = requestIdle;
    },
    clearCreateInventoryCategorySuccess: (state) => {
      state.createInventoryCategoryRequest = requestIdle;
    },
    clearEditInventoryCategorySuccess: (state) => {
      state.editInventoryCategoryRequest = requestIdle;
    },
    clearDeleteInventoryCategorySuccess: (state) => {
      state.deleteInventoryCategoryRequest = requestIdle;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Paginated
      .addCase(fetchPaginatedInventoryCategories.pending, (state) => {
        state.fetchPaginatedInventoryCategoriesRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(fetchPaginatedInventoryCategories.fulfilled, (state, action) => {
        state.inventoryCategories = action.payload.docs;
        state.inventoryCategoriesTotal = action.payload.totalDocs;
        state.fetchPaginatedInventoryCategoriesRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(fetchPaginatedInventoryCategories.rejected, (state, action) => {
        state.fetchPaginatedInventoryCategoriesRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al obtener las categorías",
          ok: false,
        };
      })
      // Fetch All
      .addCase(fetchInventoryCategories.pending, (state) => {
        state.fetchInventoryCategoriesRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(fetchInventoryCategories.fulfilled, (state, action) => {
        state.inventoryCategoriesList = action.payload;
        state.fetchInventoryCategoriesRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(fetchInventoryCategories.rejected, (state, action) => {
        state.fetchInventoryCategoriesRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al obtener las categorías",
          ok: false,
        };
      })
      // Fetch Options
      .addCase(fetchInventoryCategoriesOptions.pending, (state) => {
        state.fetchInventoryCategoriesOptionsRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(fetchInventoryCategoriesOptions.fulfilled, (state, action) => {
        state.inventoryCategoriesOptions = action.payload;
        state.fetchInventoryCategoriesOptionsRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(fetchInventoryCategoriesOptions.rejected, (state, action) => {
        state.fetchInventoryCategoriesOptionsRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al obtener las opciones de categorías",
          ok: false,
        };
      })
      // Fetch Details
      .addCase(fetchInventoryCategoryDetails.pending, (state) => {
        state.fetchInventoryCategoryDetailsRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(fetchInventoryCategoryDetails.fulfilled, (state, action) => {
        state.inventoryCategoryDetails = action.payload;
        state.fetchInventoryCategoryDetailsRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(fetchInventoryCategoryDetails.rejected, (state, action) => {
        state.fetchInventoryCategoryDetailsRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al obtener los detalles de la categoría",
          ok: false,
        };
      })
      // Create
      .addCase(createInventoryCategoryThunk.pending, (state) => {
        state.createInventoryCategoryRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(createInventoryCategoryThunk.fulfilled, (state) => {
        state.createInventoryCategoryRequest = {
          inProgress: false,
          messages: "Categoría creada correctamente",
          ok: true,
        };
      })
      .addCase(createInventoryCategoryThunk.rejected, (state, action) => {
        state.createInventoryCategoryRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al crear la categoría",
          ok: false,
        };
      })
      // Edit
      .addCase(editInventoryCategoryThunk.pending, (state) => {
        state.editInventoryCategoryRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(editInventoryCategoryThunk.fulfilled, (state) => {
        state.editInventoryCategoryRequest = {
          inProgress: false,
          messages: "Categoría editada correctamente",
          ok: true,
        };
      })
      .addCase(editInventoryCategoryThunk.rejected, (state, action) => {
        state.editInventoryCategoryRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al editar la categoría",
          ok: false,
        };
      })
      // Delete
      .addCase(deleteInventoryCategoryThunk.pending, (state) => {
        state.deleteInventoryCategoryRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(deleteInventoryCategoryThunk.fulfilled, (state, action) => {
        state.inventoryCategories = state.inventoryCategories.filter(
          (c) => c._id !== action.payload
        );
        state.deleteInventoryCategoryRequest = {
          inProgress: false,
          messages: "Categoría eliminada correctamente",
          ok: true,
        };
      })
      .addCase(deleteInventoryCategoryThunk.rejected, (state, action) => {
        state.deleteInventoryCategoryRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al eliminar la categoría",
          ok: false,
        };
      });
  },
});

export const {
  clearInventoryCategoriesTable,
  clearInventoryCategoryDetails,
  clearCreateInventoryCategorySuccess,
  clearEditInventoryCategorySuccess,
  clearDeleteInventoryCategorySuccess,
} = inventoryCategoriesSlice.actions;

export default inventoryCategoriesSlice.reducer;
