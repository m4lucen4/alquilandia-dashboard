import { createSlice } from "@reduxjs/toolkit";
import type { IRequest } from "@/types/auth";
import type { StatisticsState } from "@/types/statistics";
import {
  fetchAdviserStatisticsThunk,
  fetchInventoryStatisticsThunk,
  fetchMoneyStatisticsThunk,
  fetchVatStatisticsThunk,
} from "../actions/statistics";
import { logout } from "../actions/auth";

const requestIdle: IRequest = { inProgress: false, messages: "", ok: false };
const requestError = (message: unknown, fallback: string): IRequest => ({
  inProgress: false,
  messages: typeof message === "string" ? message : fallback,
  ok: false,
});

const createInitialState = (): StatisticsState => ({
  money: null,
  adviser: [],
  inventory: [],
  vat: null,
  vatMetadata: null,
  fetchMoneyRequest: requestIdle,
  fetchAdviserRequest: requestIdle,
  fetchInventoryRequest: requestIdle,
  fetchVatRequest: requestIdle,
});

const statisticsSlice = createSlice({
  name: "statistics",
  initialState: createInitialState(),
  reducers: {
    clearStatistics: () => createInitialState(),
  },
  extraReducers: (builder) => builder
    .addCase(logout.fulfilled, () => createInitialState())
    .addCase(fetchMoneyStatisticsThunk.pending, (state, action) => {
      state.latestMoneyRequestId = action.meta.requestId;
      state.fetchMoneyRequest = { inProgress: true, messages: "", ok: false };
    })
    .addCase(fetchMoneyStatisticsThunk.fulfilled, (state, action) => {
      if (state.latestMoneyRequestId === action.meta.requestId) {
        state.money = action.payload;
        state.fetchMoneyRequest = { inProgress: false, messages: "", ok: true };
      }
    })
    .addCase(fetchMoneyStatisticsThunk.rejected, (state, action) => {
      if (state.latestMoneyRequestId === action.meta.requestId) {
        state.fetchMoneyRequest = requestError(action.payload, "Error al cargar las estadísticas de ingresos y gastos");
      }
    })
    .addCase(fetchAdviserStatisticsThunk.pending, (state, action) => {
      state.latestAdviserRequestId = action.meta.requestId;
      state.fetchAdviserRequest = { inProgress: true, messages: "", ok: false };
    })
    .addCase(fetchAdviserStatisticsThunk.fulfilled, (state, action) => {
      if (state.latestAdviserRequestId === action.meta.requestId) {
        state.adviser = action.payload;
        state.fetchAdviserRequest = { inProgress: false, messages: "", ok: true };
      }
    })
    .addCase(fetchAdviserStatisticsThunk.rejected, (state, action) => {
      if (state.latestAdviserRequestId === action.meta.requestId) {
        state.fetchAdviserRequest = requestError(action.payload, "Error al cargar las estadísticas de asesores");
      }
    })
    .addCase(fetchInventoryStatisticsThunk.pending, (state, action) => {
      state.latestInventoryRequestId = action.meta.requestId;
      state.fetchInventoryRequest = { inProgress: true, messages: "", ok: false };
    })
    .addCase(fetchInventoryStatisticsThunk.fulfilled, (state, action) => {
      if (state.latestInventoryRequestId === action.meta.requestId) {
        state.inventory = action.payload;
        state.fetchInventoryRequest = { inProgress: false, messages: "", ok: true };
      }
    })
    .addCase(fetchInventoryStatisticsThunk.rejected, (state, action) => {
      if (state.latestInventoryRequestId === action.meta.requestId) {
        state.fetchInventoryRequest = requestError(action.payload, "Error al cargar las estadísticas de inventario");
      }
    })
    .addCase(fetchVatStatisticsThunk.pending, (state, action) => {
      state.latestVatRequestId = action.meta.requestId;
      state.vat = null;
      state.vatMetadata = null;
      state.fetchVatRequest = { inProgress: true, messages: "", ok: false };
    })
    .addCase(fetchVatStatisticsThunk.fulfilled, (state, action) => {
      if (state.latestVatRequestId === action.meta.requestId) {
        state.vat = action.payload.vat;
        state.vatMetadata = action.payload.metadata;
        state.fetchVatRequest = { inProgress: false, messages: "", ok: true };
      }
    })
    .addCase(fetchVatStatisticsThunk.rejected, (state, action) => {
      if (state.latestVatRequestId === action.meta.requestId) {
        state.fetchVatRequest = requestError(action.payload, "Error al cargar las estadísticas de IVA");
      }
    }),
});

export const { clearStatistics } = statisticsSlice.actions;
export default statisticsSlice.reducer;
