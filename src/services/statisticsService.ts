import { apiClient } from "./api";
import type {
  AdviserStatisticsRow,
  InventoryStatisticsRow,
  MoneyStatistics,
  VatStatistics,
} from "@/types/statistics";

interface AdviserStatisticsResponseRow {
  id?: { month?: number; technicianEmailHash?: string };
  month?: number;
  totalAmount?: number;
  technicianEmailHash?: string;
  technician?: {
    id?: string;
    firstName?: string;
    lastName?: string;
  };
}

const toText = (value: unknown): string => typeof value === "string" ? value : "";

const projectAdviserRow = (row: AdviserStatisticsResponseRow): AdviserStatisticsRow => ({
  month: typeof row.month === "number" ? row.month : row.id?.month ?? 0,
  totalAmount: typeof row.totalAmount === "number" ? row.totalAmount : 0,
  technicianEmailHash: toText(row.technicianEmailHash) || toText(row.id?.technicianEmailHash) || undefined,
  technician: {
    id: toText(row.technician?.id),
    firstName: toText(row.technician?.firstName),
    lastName: toText(row.technician?.lastName),
  },
});

export const fetchMoneyStatistics = async (year: number): Promise<MoneyStatistics> => {
  const response = await apiClient(`/statistics/money/${year}`);
  const statistics = await response.json() as MoneyStatistics;
  return {
    ...statistics,
    expenses: statistics.expenses ?? [],
    gaining: statistics.gaining ?? [],
  };
};

export const fetchAdviserStatistics = async (year: number): Promise<AdviserStatisticsRow[]> => {
  const response = await apiClient(`/statistics/adviser/${year}`);
  const rows = await response.json() as AdviserStatisticsResponseRow[];
  return Array.isArray(rows) ? rows.map(projectAdviserRow) : [];
};

export const fetchInventoryStatistics = async (): Promise<InventoryStatisticsRow[]> => {
  const response = await apiClient("/statistics/inventory");
  return response.json() as Promise<InventoryStatisticsRow[]>;
};

export const fetchVatStatistics = async (year: number): Promise<VatStatistics> => {
  const response = await apiClient(`/statistics/vat/${year}`);
  return response.json() as Promise<VatStatistics>;
};
