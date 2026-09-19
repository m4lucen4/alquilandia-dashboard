import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ApiError } from "@/services/api";
import {
  fetchAdviserStatistics,
  fetchInventoryStatistics,
  fetchMoneyStatistics,
} from "@/services/statisticsService";
import { fetchScopedVatStatistics } from "@/services/statisticsVatService";
import type { VatScope, VatStatisticsPayload } from "@/types/statistics";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error as ApiError;
    if (typeof message === "string") return message;
  }
  return fallback;
};

export const fetchMoneyStatisticsThunk = createAsyncThunk(
  "statistics/fetchMoney",
  async (year: number, { rejectWithValue }) => {
    try {
      return await fetchMoneyStatistics(year);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Error al cargar las estadísticas de ingresos y gastos"));
    }
  },
);

export const fetchAdviserStatisticsThunk = createAsyncThunk(
  "statistics/fetchAdviser",
  async (year: number, { rejectWithValue }) => {
    try {
      return await fetchAdviserStatistics(year);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Error al cargar las estadísticas de asesores"));
    }
  },
);

export const fetchInventoryStatisticsThunk = createAsyncThunk(
  "statistics/fetchInventory",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchInventoryStatistics();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Error al cargar las estadísticas de inventario"));
    }
  },
);

export const fetchVatStatisticsThunk = createAsyncThunk<VatStatisticsPayload, { year: number; scope: VatScope }, { rejectValue: string }>(
  "statistics/fetchVat",
  async ({ year, scope }, { rejectWithValue }) => {
    try {
      const vat = await fetchScopedVatStatistics(year, scope);
      return { vat, metadata: { year, scope, businessName: scope === "eventos" ? "Alquilandia Eventos" : "Histórico anterior al corte" } };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Error al cargar las estadísticas de IVA"));
    }
  },
);
