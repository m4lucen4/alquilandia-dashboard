import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ApiError } from "../../services/api";
import {
  getBudgets,
  getBudgetById,
  getBudgetFinalDetails,
  createBudget,
  createBudgetConfirm,
  updateBudget,
  updateBudgetTechnician,
  deleteBudget,
  rejectBudget,
  getBudgetReceipts,
  removeReceiptProducts,
  checkoutBudget,
  getStripeSecret,
  getStripeFinalSecret,
  getBudgetPaginatedProducts,
  type GetBudgetsParams,
  type CreateBudgetParams,
  type UpdateBudgetParams,
  type UpdateBudgetTechnicianParams,
  type CheckoutBudgetParams,
  type GetStripeSecretParams,
  type FetchBudgetCatalogParams,
  type RemoveReceiptProductsParams,
} from "../../services/budgetsServices";
import { getProductStock } from "../../services/inventoryService";
import type { BudgetError } from "../../types/budgets";

export const fetchBudgets = createAsyncThunk(
  "budgets/fetchAll",
  async (params: GetBudgetsParams, { rejectWithValue }) => {
    try {
      return await getBudgets(params);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al obtener presupuestos";
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchBudgetById = createAsyncThunk(
  "budgets/fetchById",
  async (budgetId: string, { rejectWithValue }) => {
    try {
      return await getBudgetById(budgetId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al obtener el presupuesto";
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchBudgetFinalDetails = createAsyncThunk(
  "budgets/fetchFinalDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getBudgetFinalDetails(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al obtener el presupuesto final";
      return rejectWithValue(errorMessage);
    }
  },
);

export const createBudgetThunk = createAsyncThunk(
  "budgets/create",
  async (params: CreateBudgetParams, { rejectWithValue }) => {
    try {
      return await createBudget(params);
    } catch (error) {
      const apiError = error as ApiError;
      const apiMessage =
        (apiError.data as { message?: string } | undefined)?.message ?? "";

      if (apiMessage === "userAlreadyExists") {
        return rejectWithValue({
          code: "USER_ALREADY_EXISTS",
        } satisfies BudgetError);
      }
      if (apiMessage === "userIsProblematic") {
        return rejectWithValue({
          code: "USER_IS_PROBLEMATIC",
        } satisfies BudgetError);
      }
      return rejectWithValue({
        code: "UNKNOWN",
        message: apiError.message || "Error al crear el presupuesto",
      } satisfies BudgetError);
    }
  },
);

export const createBudgetConfirmThunk = createAsyncThunk(
  "budgets/createConfirm",
  async (data: Record<string, unknown>, { rejectWithValue }) => {
    try {
      return await createBudgetConfirm(data);
    } catch (error) {
      const apiError = error as ApiError;
      const apiMessage =
        (apiError.data as { message?: string } | undefined)?.message ?? "";

      if (apiMessage === "userAlreadyExists") {
        return rejectWithValue({
          code: "USER_ALREADY_EXISTS",
        } satisfies BudgetError);
      }
      if (apiMessage === "userIsProblematic") {
        return rejectWithValue({
          code: "USER_IS_PROBLEMATIC",
        } satisfies BudgetError);
      }
      return rejectWithValue({
        code: "UNKNOWN",
        message: apiError.message || "Error al crear el presupuesto",
      } satisfies BudgetError);
    }
  },
);

// ─── Thunks del wizard Step 3 ─────────────────────────────────────────────────

export const fetchBudgetCatalogThunk = createAsyncThunk(
  "budgetWizard/fetchCatalog",
  async (params: FetchBudgetCatalogParams, { rejectWithValue }) => {
    try {
      const response = await getBudgetPaginatedProducts(params);
      return { response, pageToFetch: params.pageToFetch, filtersQuery: params.filtersQuery };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al obtener el catálogo";
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchCatalogStockThunk = createAsyncThunk(
  "budgetWizard/fetchStock",
  async (
    { budgetId, productIds }: { budgetId: string; productIds: string[] },
    { rejectWithValue },
  ) => {
    try {
      const results = await Promise.all(
        productIds.map((id) => getProductStock(id, budgetId)),
      );
      return productIds.reduce<Record<string, number>>((acc, id, idx) => {
        acc[id] = results[idx];
        return acc;
      }, {});
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al obtener el stock";
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateBudgetLinesThunk = createAsyncThunk(
  "budgetWizard/updateLines",
  async (params: UpdateBudgetParams, { rejectWithValue }) => {
    try {
      return await updateBudget(params);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al guardar las líneas del presupuesto";
      return rejectWithValue(errorMessage);
    }
  },
);

// ─── Thunks del wizard Step 5 ─────────────────────────────────────────────────

export const budgetWizardCheckoutThunk = createAsyncThunk(
  "budgetWizard/checkout",
  async (params: CheckoutBudgetParams, { rejectWithValue }) => {
    try {
      const result = await checkoutBudget(params);
      if (Array.isArray(result)) {
        return rejectWithValue({
          code: "PRODUCTS_UNAVAILABLE",
          products: result,
        } satisfies BudgetError);
      }
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al finalizar el presupuesto";
      return rejectWithValue({ code: "UNKNOWN", message: errorMessage } satisfies BudgetError);
    }
  },
);

export const budgetWizardArchiveThunk = createAsyncThunk(
  "budgetWizard/archive",
  async (params: UpdateBudgetParams, { rejectWithValue }) => {
    try {
      return await updateBudget(params);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al archivar el presupuesto";
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateBudgetEventDetailsThunk = createAsyncThunk(
  "budgetWizard/updateEventDetails",
  async (params: UpdateBudgetParams, { rejectWithValue }) => {
    try {
      return await updateBudget(params);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al guardar los datos del evento";
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateBudgetThunk = createAsyncThunk(
  "budgets/update",
  async (params: UpdateBudgetParams, { rejectWithValue }) => {
    try {
      return await updateBudget(params);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al actualizar el presupuesto";
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateBudgetTechnicianThunk = createAsyncThunk(
  "budgets/updateTechnician",
  async (params: UpdateBudgetTechnicianParams, { rejectWithValue }) => {
    try {
      return await updateBudgetTechnician(params);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al asignar técnico";
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteBudgetThunk = createAsyncThunk(
  "budgets/delete",
  async (budgetId: string, { rejectWithValue }) => {
    try {
      await deleteBudget(budgetId);
      return budgetId;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al eliminar el presupuesto";
      return rejectWithValue(errorMessage);
    }
  },
);

export const rejectBudgetThunk = createAsyncThunk(
  "budgets/reject",
  async (budgetId: string, { rejectWithValue }) => {
    try {
      await rejectBudget(budgetId);
      return budgetId;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al rechazar el presupuesto";
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchBudgetReceipts = createAsyncThunk(
  "budgets/fetchReceipts",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getBudgetReceipts(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al obtener los recibos";
      return rejectWithValue(errorMessage);
    }
  },
);

export const removeReceiptProductsThunk = createAsyncThunk(
  "budgets/removeReceiptProducts",
  async (params: RemoveReceiptProductsParams, { rejectWithValue }) => {
    try {
      return await removeReceiptProducts(params);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al reducir el inventario";
      return rejectWithValue(errorMessage);
    }
  },
);

export const checkoutBudgetThunk = createAsyncThunk(
  "budgets/checkout",
  async (params: CheckoutBudgetParams, { rejectWithValue }) => {
    try {
      const result = await checkoutBudget(params);
      if (Array.isArray(result)) {
        return rejectWithValue({
          code: "PRODUCTS_UNAVAILABLE",
          products: result,
        } satisfies BudgetError);
      }
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error en el checkout";
      return rejectWithValue({
        code: "UNKNOWN",
        message: errorMessage,
      } satisfies BudgetError);
    }
  },
);

export const getStripeSecretThunk = createAsyncThunk(
  "budgets/getStripeSecret",
  async (params: GetStripeSecretParams, { rejectWithValue }) => {
    try {
      const result = await getStripeSecret(params);
      if (Array.isArray(result)) {
        return rejectWithValue({
          code: "PRODUCTS_UNAVAILABLE",
          products: result,
        } satisfies BudgetError);
      }
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al obtener el secret de Stripe";
      return rejectWithValue({
        code: "UNKNOWN",
        message: errorMessage,
      } satisfies BudgetError);
    }
  },
);

export const getStripeFinalSecretThunk = createAsyncThunk(
  "budgets/getStripeFinalSecret",
  async (params: GetStripeSecretParams, { rejectWithValue }) => {
    try {
      const result = await getStripeFinalSecret(params);
      if (Array.isArray(result)) {
        return rejectWithValue({
          code: "PRODUCTS_UNAVAILABLE",
          products: result,
        } satisfies BudgetError);
      }
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al obtener el secret final de Stripe";
      return rejectWithValue({
        code: "UNKNOWN",
        message: errorMessage,
      } satisfies BudgetError);
    }
  },
);
