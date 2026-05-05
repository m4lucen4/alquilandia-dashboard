import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { createBudgetThunk, updateBudgetEventDetailsThunk } from "../actions/budgets";
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
    goBackStep(state) {
      if (state.step > 1) state.step -= 1;
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

export const { setPrefillData, setExistingBudget, goBackStep, resetWizard, clearCreateBudgetError } =
  budgetWizardSlice.actions;

export default budgetWizardSlice.reducer;
