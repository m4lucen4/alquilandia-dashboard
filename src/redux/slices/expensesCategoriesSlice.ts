import { createSlice } from "@reduxjs/toolkit";
import type { IRequest } from "@/types/auth";
import type { ExpensesCategoriesState } from "@/types/expensesCategories";
import { createExpenseCategoryThunk, deleteExpenseCategoryThunk, fetchAllExpensesCategoriesThunk, fetchExpenseCategoryDetailsThunk, fetchExpensesCategoryOptionsThunk, fetchPaginatedExpensesCategoriesThunk, updateExpenseCategoryThunk } from "../actions/expensesCategories";

const requestIdle: IRequest = { inProgress: false, messages: "", ok: false };
const requestError = (message: unknown, fallback: string): IRequest => ({ inProgress: false, messages: typeof message === "string" ? message : fallback, ok: false });
const initialState: ExpensesCategoriesState = { expensesCategories: [], total: 0, allExpensesCategories: [], currentExpenseCategory: null, options: { principals: [], subcategories: [] }, fetchExpensesCategoriesRequest: requestIdle, fetchAllExpensesCategoriesRequest: requestIdle, fetchExpenseCategoryDetailsRequest: requestIdle, fetchExpensesCategoryOptionsRequest: requestIdle, createExpenseCategoryRequest: requestIdle, updateExpenseCategoryRequest: requestIdle, deleteExpenseCategoryRequest: requestIdle };

const expensesCategoriesSlice = createSlice({
  name: "expensesCategories", initialState,
  reducers: {
    clearExpenseCategoryDetails: (state) => { state.currentExpenseCategory = null; state.fetchExpenseCategoryDetailsRequest = requestIdle; },
    resetExpenseCategoryMutationRequests: (state) => { state.createExpenseCategoryRequest = requestIdle; state.updateExpenseCategoryRequest = requestIdle; state.deleteExpenseCategoryRequest = requestIdle; },
    clearExpensesCategories: (state) => { state.expensesCategories = []; state.total = 0; state.fetchExpensesCategoriesRequest = requestIdle; },
  },
  extraReducers: (builder) => builder
    .addCase(fetchPaginatedExpensesCategoriesThunk.pending, (state, action) => { state.latestFetchRequestId = action.meta.requestId; state.fetchExpensesCategoriesRequest = { inProgress: true, messages: "", ok: false }; })
    .addCase(fetchPaginatedExpensesCategoriesThunk.fulfilled, (state, action) => { if (state.latestFetchRequestId === action.meta.requestId) { state.expensesCategories = action.payload.expensesCategories; state.total = action.payload.total ?? 0; state.fetchExpensesCategoriesRequest = { inProgress: false, messages: "", ok: true }; } })
    .addCase(fetchPaginatedExpensesCategoriesThunk.rejected, (state, action) => { if (state.latestFetchRequestId === action.meta.requestId) state.fetchExpensesCategoriesRequest = requestError(action.payload, "Error al cargar las categorías"); })
    .addCase(fetchAllExpensesCategoriesThunk.pending, (state) => { state.fetchAllExpensesCategoriesRequest = { inProgress: true, messages: "", ok: false }; })
    .addCase(fetchAllExpensesCategoriesThunk.fulfilled, (state, action) => { state.allExpensesCategories = action.payload; state.fetchAllExpensesCategoriesRequest = { inProgress: false, messages: "", ok: true }; })
    .addCase(fetchAllExpensesCategoriesThunk.rejected, (state, action) => { state.fetchAllExpensesCategoriesRequest = requestError(action.payload, "Error al cargar las categorías"); })
    .addCase(fetchExpenseCategoryDetailsThunk.pending, (state, action) => { state.latestDetailsRequestId = action.meta.requestId; state.fetchExpenseCategoryDetailsRequest = { inProgress: true, messages: "", ok: false }; })
    .addCase(fetchExpenseCategoryDetailsThunk.fulfilled, (state, action) => { if (state.latestDetailsRequestId === action.meta.requestId) { state.currentExpenseCategory = action.payload; state.fetchExpenseCategoryDetailsRequest = { inProgress: false, messages: "", ok: true }; } })
    .addCase(fetchExpenseCategoryDetailsThunk.rejected, (state, action) => { if (state.latestDetailsRequestId === action.meta.requestId) state.fetchExpenseCategoryDetailsRequest = requestError(action.payload, "Error al cargar la categoría"); })
    .addCase(fetchExpensesCategoryOptionsThunk.pending, (state) => { state.fetchExpensesCategoryOptionsRequest = { inProgress: true, messages: "", ok: false }; })
    .addCase(fetchExpensesCategoryOptionsThunk.fulfilled, (state, action) => { state.options = action.payload; state.fetchExpensesCategoryOptionsRequest = { inProgress: false, messages: "", ok: true }; })
    .addCase(fetchExpensesCategoryOptionsThunk.rejected, (state, action) => { state.fetchExpensesCategoryOptionsRequest = requestError(action.payload, "Error al cargar las opciones"); })
    .addCase(createExpenseCategoryThunk.pending, (state) => { state.createExpenseCategoryRequest = { inProgress: true, messages: "", ok: false }; })
    .addCase(createExpenseCategoryThunk.fulfilled, (state) => { state.createExpenseCategoryRequest = { inProgress: false, messages: "", ok: true }; })
    .addCase(createExpenseCategoryThunk.rejected, (state, action) => { state.createExpenseCategoryRequest = requestError(action.payload, "Error al crear la categoría"); })
    .addCase(updateExpenseCategoryThunk.pending, (state) => { state.updateExpenseCategoryRequest = { inProgress: true, messages: "", ok: false }; })
    .addCase(updateExpenseCategoryThunk.fulfilled, (state) => { state.updateExpenseCategoryRequest = { inProgress: false, messages: "", ok: true }; })
    .addCase(updateExpenseCategoryThunk.rejected, (state, action) => { state.updateExpenseCategoryRequest = requestError(action.payload, "Error al actualizar la categoría"); })
    .addCase(deleteExpenseCategoryThunk.pending, (state) => { state.deleteExpenseCategoryRequest = { inProgress: true, messages: "", ok: false }; })
    .addCase(deleteExpenseCategoryThunk.fulfilled, (state) => { state.deleteExpenseCategoryRequest = { inProgress: false, messages: "", ok: true }; })
    .addCase(deleteExpenseCategoryThunk.rejected, (state, action) => { state.deleteExpenseCategoryRequest = requestError(action.payload, "Error al eliminar la categoría"); }),
});

export const { clearExpenseCategoryDetails, resetExpenseCategoryMutationRequests, clearExpensesCategories } = expensesCategoriesSlice.actions;
export default expensesCategoriesSlice.reducer;
