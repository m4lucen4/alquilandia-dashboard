import type { IRequest } from "./auth";

export interface MonthlyAmount {
  month: number;
  totalAmount: number;
}

export interface VatMonthlyAmount extends MonthlyAmount {
  totalVAT: number;
}

export interface MoneyStatistics {
  expenses: MonthlyAmount[];
  gaining: MonthlyAmount[];
}

export interface AdviserStatisticsRow {
  month: number;
  totalAmount: number;
  technicianEmailHash?: string;
  technician: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface InventoryStatisticsRow {
  subcategory: { nombre: string } | null;
  price: number;
}

export interface VatStatistics {
  expenses: VatMonthlyAmount[];
  gaining: VatMonthlyAmount[];
}

export type VatScope = "eventos" | "historical";

export interface VatReportMetadata {
  year: number;
  scope: VatScope;
  businessName: string;
}

export interface VatStatisticsPayload {
  vat: VatStatistics;
  metadata: VatReportMetadata;
}

export interface StatisticsState {
  money: MoneyStatistics | null;
  adviser: AdviserStatisticsRow[];
  inventory: InventoryStatisticsRow[];
  vat: VatStatistics | null;
  fetchMoneyRequest: IRequest;
  fetchAdviserRequest: IRequest;
  fetchInventoryRequest: IRequest;
  fetchVatRequest: IRequest;
  latestMoneyRequestId?: string;
  latestAdviserRequestId?: string;
  latestInventoryRequestId?: string;
  latestVatRequestId?: string;
  vatMetadata: VatReportMetadata | null;
}
