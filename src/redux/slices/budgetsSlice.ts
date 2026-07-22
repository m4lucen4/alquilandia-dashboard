import { createSlice } from "@reduxjs/toolkit";
import {
  fetchBudgets,
  fetchBudgetById,
  fetchBudgetFinalDetails,
  createBudgetThunk,
  createBudgetConfirmThunk,
  updateBudgetThunk,
  updateBudgetTechnicianThunk,
  deleteBudgetThunk,
  rejectBudgetThunk,
  fetchBudgetReceipts,
  checkoutBudgetThunk,
  getStripeSecretThunk,
  getStripeFinalSecretThunk,
} from "../actions/budgets";
import type { BudgetsState } from "@/types/budgets";

const requestIdle = { inProgress: false, messages: "", ok: false };

const initialState: BudgetsState = {
  budgets: [],
  total: 0,
  currentBudget: null,
  receipts: [],
  stripeSecret: null,
  stripeFinalSecret: null,
  fetchBudgetsRequest: requestIdle,
  fetchBudgetByIdRequest: requestIdle,
  fetchBudgetFinalDetailsRequest: requestIdle,
  createBudgetRequest: requestIdle,
  createBudgetConfirmRequest: requestIdle,
  updateBudgetRequest: requestIdle,
  updateBudgetTechnicianRequest: requestIdle,
  deleteBudgetRequest: requestIdle,
  rejectBudgetRequest: requestIdle,
  fetchBudgetReceiptsRequest: requestIdle,
  checkoutRequest: requestIdle,
  getStripeSecretRequest: requestIdle,
  getStripeFinalSecretRequest: requestIdle,
};

const budgetsSlice = createSlice({
  name: "budgets",
  initialState,
  reducers: {
    clearBudgets: (state) => {
      state.budgets = [];
      state.total = 0;
      state.fetchBudgetsRequest = requestIdle;
    },
    clearBudgetsErrors: (state) => {
      state.fetchBudgetsRequest = requestIdle;
    },
    clearBudgetByIdErrors: (state) => {
      state.fetchBudgetByIdRequest = requestIdle;
    },
    clearCurrentBudget: (state) => {
      state.currentBudget = null;
      state.fetchBudgetByIdRequest = requestIdle;
      state.fetchBudgetFinalDetailsRequest = requestIdle;
    },
    clearReceipts: (state) => {
      state.receipts = [];
      state.fetchBudgetReceiptsRequest = requestIdle;
    },
    clearStripeSecrets: (state) => {
      state.stripeSecret = null;
      state.stripeFinalSecret = null;
      state.getStripeSecretRequest = requestIdle;
      state.getStripeFinalSecretRequest = requestIdle;
    },
    clearRejectBudgetErrors: (state) => {
      state.rejectBudgetRequest = requestIdle;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.fetchBudgetsRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.budgets = action.payload.budgets;
        state.total = action.payload.total || 0;
        state.fetchBudgetsRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.fetchBudgetsRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al obtener presupuestos",
          ok: false,
        };
      })
      .addCase(fetchBudgetById.pending, (state) => {
        state.fetchBudgetByIdRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(fetchBudgetById.fulfilled, (state, action) => {
        state.currentBudget = action.payload;
        state.fetchBudgetByIdRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(fetchBudgetById.rejected, (state, action) => {
        state.fetchBudgetByIdRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al obtener el presupuesto",
          ok: false,
        };
      })
      // fetchBudgetFinalDetails
      .addCase(fetchBudgetFinalDetails.pending, (state) => {
        state.fetchBudgetFinalDetailsRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(fetchBudgetFinalDetails.fulfilled, (state, action) => {
        state.currentBudget = action.payload;
        state.fetchBudgetFinalDetailsRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(fetchBudgetFinalDetails.rejected, (state, action) => {
        state.fetchBudgetFinalDetailsRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al obtener el presupuesto final",
          ok: false,
        };
      })
      // createBudgetThunk
      .addCase(createBudgetThunk.pending, (state) => {
        state.createBudgetRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(createBudgetThunk.fulfilled, (state) => {
        state.createBudgetRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(createBudgetThunk.rejected, (state, action) => {
        state.createBudgetRequest = {
          inProgress: false,
          messages: (action.payload as { message?: string })?.message || "Error al crear el presupuesto",
          ok: false,
        };
      })
      // createBudgetConfirmThunk
      .addCase(createBudgetConfirmThunk.pending, (state) => {
        state.createBudgetConfirmRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(createBudgetConfirmThunk.fulfilled, (state) => {
        state.createBudgetConfirmRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(createBudgetConfirmThunk.rejected, (state, action) => {
        state.createBudgetConfirmRequest = {
          inProgress: false,
          messages: (action.payload as { message?: string })?.message || "Error al crear el presupuesto",
          ok: false,
        };
      })
      // updateBudgetThunk
      .addCase(updateBudgetThunk.pending, (state) => {
        state.updateBudgetRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(updateBudgetThunk.fulfilled, (state, action) => {
        state.currentBudget = action.payload;
        state.updateBudgetRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(updateBudgetThunk.rejected, (state, action) => {
        state.updateBudgetRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al actualizar el presupuesto",
          ok: false,
        };
      })
      // updateBudgetTechnicianThunk
      .addCase(updateBudgetTechnicianThunk.pending, (state) => {
        state.updateBudgetTechnicianRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(updateBudgetTechnicianThunk.fulfilled, (state, action) => {
        state.currentBudget = action.payload;
        state.updateBudgetTechnicianRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(updateBudgetTechnicianThunk.rejected, (state, action) => {
        state.updateBudgetTechnicianRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al asignar técnico",
          ok: false,
        };
      })
      // deleteBudgetThunk
      .addCase(deleteBudgetThunk.pending, (state) => {
        state.deleteBudgetRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(deleteBudgetThunk.fulfilled, (state) => {
        state.deleteBudgetRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(deleteBudgetThunk.rejected, (state, action) => {
        state.deleteBudgetRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al eliminar el presupuesto",
          ok: false,
        };
      })
      // rejectBudgetThunk
      .addCase(rejectBudgetThunk.pending, (state) => {
        state.rejectBudgetRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(rejectBudgetThunk.fulfilled, (state) => {
        state.rejectBudgetRequest = {
          inProgress: false,
          messages: "El presupuesto ha sido rechazado correctamente",
          ok: true,
        };
      })
      .addCase(rejectBudgetThunk.rejected, (state, action) => {
        state.rejectBudgetRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al rechazar el presupuesto",
          ok: false,
        };
      })
      // fetchBudgetReceipts
      .addCase(fetchBudgetReceipts.pending, (state) => {
        state.fetchBudgetReceiptsRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(fetchBudgetReceipts.fulfilled, (state, action) => {
        state.receipts = action.payload;
        state.fetchBudgetReceiptsRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(fetchBudgetReceipts.rejected, (state, action) => {
        state.fetchBudgetReceiptsRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al obtener los recibos",
          ok: false,
        };
      })
      // checkoutBudgetThunk
      .addCase(checkoutBudgetThunk.pending, (state) => {
        state.checkoutRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(checkoutBudgetThunk.fulfilled, (state, action) => {
        state.currentBudget = action.payload;
        state.checkoutRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(checkoutBudgetThunk.rejected, (state, action) => {
        state.checkoutRequest = {
          inProgress: false,
          messages: (action.payload as { message?: string })?.message || "Error en el checkout",
          ok: false,
        };
      })
      // getStripeSecretThunk
      .addCase(getStripeSecretThunk.pending, (state) => {
        state.getStripeSecretRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(getStripeSecretThunk.fulfilled, (state, action) => {
        state.stripeSecret = action.payload;
        state.getStripeSecretRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(getStripeSecretThunk.rejected, (state, action) => {
        state.getStripeSecretRequest = {
          inProgress: false,
          messages: (action.payload as { message?: string })?.message || "Error al obtener el secret de Stripe",
          ok: false,
        };
      })
      // getStripeFinalSecretThunk
      .addCase(getStripeFinalSecretThunk.pending, (state) => {
        state.getStripeFinalSecretRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(getStripeFinalSecretThunk.fulfilled, (state, action) => {
        state.stripeFinalSecret = action.payload;
        state.getStripeFinalSecretRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(getStripeFinalSecretThunk.rejected, (state, action) => {
        state.getStripeFinalSecretRequest = {
          inProgress: false,
          messages: (action.payload as { message?: string })?.message || "Error al obtener el secret final de Stripe",
          ok: false,
        };
      });
  },
});

export const {
  clearBudgets,
  clearBudgetsErrors,
  clearBudgetByIdErrors,
  clearCurrentBudget,
  clearReceipts,
  clearStripeSecrets,
  clearRejectBudgetErrors,
} = budgetsSlice.actions;

export default budgetsSlice.reducer;
