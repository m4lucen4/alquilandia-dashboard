import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  createBudgetThunk,
  updateBudgetEventDetailsThunk,
  fetchBudgetCatalogThunk,
  fetchCatalogStockThunk,
  updateBudgetLinesThunk,
  budgetWizardCheckoutThunk,
  budgetWizardArchiveThunk,
} from "../actions/budgets";
import type { BudgetWizardState, ClientWizardFormData } from "@/types/budgetWizard";
import type { Budget, BudgetError } from "@/types/budgets";

const requestIdle = { inProgress: false, messages: "", ok: false };

const initialState: BudgetWizardState = {
  step: 1,
  prefillData: null,
  budgetId: null,
  budget: null,
  createBudgetRequest: requestIdle,
  updateEventDetailsRequest: requestIdle,
  catalogProducts: [],
  catalogTotal: 0,
  catalogPage: 1,
  catalogFiltersQuery: "",
  stockByProductId: {},
  fetchCatalogRequest: requestIdle,
  fetchStockRequest: requestIdle,
  updateLinesRequest: requestIdle,
  finalizeRequest: requestIdle,
  unavailableProducts: [],
};

const budgetWizardSlice = createSlice({
  name: "budgetWizard",
  initialState,
  reducers: {
    setPrefillData(state, action: PayloadAction<ClientWizardFormData>) {
      state.prefillData = action.payload;
      state.step = 1;
      state.budgetId = null;
      state.budget = null;
    },
    setExistingBudget(state, action: PayloadAction<Budget>) {
      state.budgetId = action.payload.id;
      state.budget = action.payload;
      state.step = 2;
      state.prefillData = null;
      state.createBudgetRequest = requestIdle;
    },
    rescueBudget(state, action: PayloadAction<Budget>) {
      state.budgetId = action.payload.id;
      state.budget = action.payload;
      state.step = 3;
      state.prefillData = null;
      state.createBudgetRequest = requestIdle;
      state.updateEventDetailsRequest = requestIdle;
    },
    goBackStep(state) {
      if (state.step > 1) state.step -= 1;
    },
    goNextStep(state) {
      if (state.step < 5) state.step += 1;
    },
    goToStep(state, action: PayloadAction<number>) {
      if (action.payload >= 1 && action.payload <= 5) state.step = action.payload;
    },
    resetWizard() {
      return initialState;
    },
    clearCreateBudgetError(state) {
      state.createBudgetRequest = requestIdle;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createBudgetThunk.pending, (state) => {
      state.createBudgetRequest = { inProgress: true, messages: "", ok: false };
    });
    builder.addCase(createBudgetThunk.fulfilled, (state, action) => {
      state.createBudgetRequest = { inProgress: false, messages: "", ok: true };
      state.budgetId = action.payload.id;
      state.budget = action.payload;
      state.step = 2;
    });
    builder.addCase(updateBudgetEventDetailsThunk.pending, (state) => {
      state.updateEventDetailsRequest = { inProgress: true, messages: "", ok: false };
    });
    builder.addCase(updateBudgetEventDetailsThunk.fulfilled, (state, action) => {
      state.updateEventDetailsRequest = { inProgress: false, messages: "", ok: true };
      state.budget = action.payload;
      state.step = 3;
    });
    builder.addCase(updateBudgetEventDetailsThunk.rejected, (state, action) => {
      state.updateEventDetailsRequest = {
        inProgress: false,
        messages: (action.payload as string) || "Error al guardar los datos del evento",
        ok: false,
      };
    });
    // Step 3 — catálogo
    builder.addCase(fetchBudgetCatalogThunk.pending, (state) => {
      state.fetchCatalogRequest = { inProgress: true, messages: "", ok: false };
    });
    builder.addCase(fetchBudgetCatalogThunk.fulfilled, (state, action) => {
      state.fetchCatalogRequest = { inProgress: false, messages: "", ok: true };
      state.catalogProducts = action.payload.response.inventory ?? [];
      state.catalogTotal = action.payload.response.total ?? 0;
      state.catalogPage = action.payload.pageToFetch;
      state.catalogFiltersQuery = action.payload.filtersQuery;
    });
    builder.addCase(fetchBudgetCatalogThunk.rejected, (state, action) => {
      state.fetchCatalogRequest = {
        inProgress: false,
        messages: (action.payload as string) || "Error al obtener el catálogo",
        ok: false,
      };
    });

    builder.addCase(fetchCatalogStockThunk.pending, (state) => {
      state.fetchStockRequest = { inProgress: true, messages: "", ok: false };
    });
    builder.addCase(fetchCatalogStockThunk.fulfilled, (state, action) => {
      state.fetchStockRequest = { inProgress: false, messages: "", ok: true };
      state.stockByProductId = action.payload;
    });
    builder.addCase(fetchCatalogStockThunk.rejected, (state, action) => {
      state.fetchStockRequest = {
        inProgress: false,
        messages: (action.payload as string) || "Error al obtener el stock",
        ok: false,
      };
    });

    // updateLines: guarda budget sin avanzar step
    builder.addCase(updateBudgetLinesThunk.pending, (state) => {
      state.updateLinesRequest = { inProgress: true, messages: "", ok: false };
    });
    builder.addCase(updateBudgetLinesThunk.fulfilled, (state, action) => {
      state.updateLinesRequest = { inProgress: false, messages: "", ok: true };
      state.budget = action.payload;
    });
    builder.addCase(updateBudgetLinesThunk.rejected, (state, action) => {
      state.updateLinesRequest = {
        inProgress: false,
        messages: (action.payload as string) || "Error al guardar las líneas del presupuesto",
        ok: false,
      };
    });

    // Step 5 — checkout
    builder.addCase(budgetWizardCheckoutThunk.pending, (state) => {
      state.finalizeRequest = { inProgress: true, messages: "", ok: false };
      state.unavailableProducts = [];
    });
    builder.addCase(budgetWizardCheckoutThunk.fulfilled, (state, action) => {
      state.finalizeRequest = { inProgress: false, messages: "", ok: true };
      state.budget = action.payload;
    });
    builder.addCase(budgetWizardCheckoutThunk.rejected, (state, action) => {
      const error = action.payload as BudgetError;
      if (error?.code === "PRODUCTS_UNAVAILABLE") {
        state.unavailableProducts = error.products ?? [];
        state.finalizeRequest = {
          inProgress: false,
          messages: "Algunos productos ya no están disponibles para la fecha seleccionada.",
          ok: false,
        };
      } else {
        state.finalizeRequest = {
          inProgress: false,
          messages: error?.message ?? "Error al finalizar el presupuesto",
          ok: false,
        };
      }
    });

    // Step 5 — archivar
    builder.addCase(budgetWizardArchiveThunk.pending, (state) => {
      state.finalizeRequest = { inProgress: true, messages: "", ok: false };
    });
    builder.addCase(budgetWizardArchiveThunk.fulfilled, (state, action) => {
      state.finalizeRequest = { inProgress: false, messages: "", ok: true };
      state.budget = action.payload;
    });
    builder.addCase(budgetWizardArchiveThunk.rejected, (state, action) => {
      state.finalizeRequest = {
        inProgress: false,
        messages: (action.payload as string) || "Error al archivar el presupuesto",
        ok: false,
      };
    });

    builder.addCase(createBudgetThunk.rejected, (state, action) => {
      const error = action.payload as BudgetError;
      if (
        error?.code === "USER_ALREADY_EXISTS" ||
        error?.code === "USER_IS_PROBLEMATIC"
      ) {
        state.createBudgetRequest = requestIdle;
        return;
      }
      state.createBudgetRequest = {
        inProgress: false,
        messages: error?.message ?? "Error al crear el presupuesto",
        ok: false,
      };
    });
  },
});

export const { setPrefillData, setExistingBudget, rescueBudget, goBackStep, goNextStep, goToStep, resetWizard, clearCreateBudgetError } =
  budgetWizardSlice.actions;

export default budgetWizardSlice.reducer;
