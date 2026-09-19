import { supabase } from "@/config/supabase";
import type { VatMonthlyAmount, VatScope, VatStatistics } from "@/types/statistics";
import { fetchVatStatistics } from "./statisticsService";

const eventosLegalName = "Alquilandia Eventos S.L.";
const cutover = "2026-07-01T00:00:00.000Z";
const pageSize = 250;
const maxPages = 1000;
const decimalVatPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

interface InvoiceVatRow {
  id: string;
  business_id: string;
  created_at: string;
  vat: unknown;
}

const errorMessage = (message: string): Error => new Error(message);

const parseVat = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim();
    if (decimalVatPattern.test(normalized)) {
      const parsed = Number(normalized);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  throw errorMessage("La factura contiene un IVA no válido.");
};

const validateScope = (year: number, scope: VatScope): void => {
  if (!Number.isInteger(year) || year < 2017 || year > 2099) {
    throw errorMessage("El año de IVA no es válido.");
  }
  if (scope === "eventos" && year < 2026) {
    throw errorMessage("Alquilandia Eventos no está disponible para ese año.");
  }
  if (scope === "historical" && year > 2026) {
    throw errorMessage("El histórico no está disponible para ese año.");
  }
};

const getUtcMonth = (value: string): number => {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) throw errorMessage("La factura contiene una fecha no válida.");
  return new Date(timestamp).getUTCMonth() + 1;
};

const validateLegacyRows = (rows: unknown, label: string): VatMonthlyAmount[] => {
  if (!Array.isArray(rows)) throw errorMessage(`Los ${label} históricos no son válidos.`);
  return rows.map((row) => {
    if (typeof row !== "object" || row === null) throw errorMessage(`Los ${label} históricos no son válidos.`);
    const { month, totalAmount, totalVAT } = row as Record<string, unknown>;
    if (
      !Number.isInteger(month) || (month as number) < 1 || (month as number) > 12
      || typeof totalAmount !== "number" || !Number.isFinite(totalAmount)
      || typeof totalVAT !== "number" || !Number.isFinite(totalVAT)
    ) throw errorMessage(`Los ${label} históricos no son válidos.`);
    return { month: month as number, totalAmount, totalVAT };
  });
};

const periodStart = (year: number, scope: VatScope): string =>
  scope === "eventos" && year === 2026 ? cutover : `${year}-01-01T00:00:00.000Z`;

const periodEnd = (year: number): string => `${year + 1}-01-01T00:00:00.000Z`;

export const getVatScopeMonths = (year: number, scope: VatScope): number[] => {
  validateScope(year, scope);
  const start = year === 2026 ? (scope === "eventos" ? 7 : 1) : 1;
  const end = year === 2026 && scope === "historical" ? 6 : 12;
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export const fetchEventosVatStatistics = async (year: number): Promise<VatStatistics> => {
  validateScope(year, "eventos");
  const { data: businesses, error: businessError } = await supabase
    .from("business")
    .select("id, name")
    .eq("name", eventosLegalName);
  if (businessError) throw errorMessage(businessError.message);
  if (businesses?.length !== 1) {
    throw errorMessage("No se pudo resolver de forma única Alquilandia Eventos.");
  }
  const business = businesses[0];
  const start = periodStart(year, "eventos");
  const end = periodEnd(year);
  const startTimestamp = Date.parse(start);
  const endTimestamp = Date.parse(end);
  const invoices: InvoiceVatRow[] = [];
  const ids = new Set<string>();
  let expectedCount: number | null = null;

  for (let page = 0; page < maxPages; page += 1) {
    const from = invoices.length;
    const to = from + pageSize - 1;
    const { data, error, count } = await supabase
      .from("invoices")
      .select("id, business_id, created_at, vat:price->>vat", { count: "exact" })
      .eq("business_id", business.id)
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to);
    if (error) throw errorMessage(error.message);
    if (typeof count !== "number" || !Number.isInteger(count) || count < 0) {
      throw errorMessage("No se pudo comprobar que las facturas estén completas.");
    }
    const pageCount = count;
    if (expectedCount === null) expectedCount = pageCount;
    if (expectedCount !== pageCount) throw errorMessage("El total de facturas cambió durante la consulta.");
    if (!Array.isArray(data)) throw errorMessage("La consulta de facturas no es válida.");
    const rows = data as InvoiceVatRow[];
    for (const invoice of rows) {
      if (!invoice.id || ids.has(invoice.id)) throw errorMessage("La consulta de facturas contiene registros duplicados.");
      if (invoice.business_id !== business.id) throw errorMessage("La consulta de facturas contiene una empresa no válida.");
      const timestamp = Date.parse(invoice.created_at);
      if (!Number.isFinite(timestamp) || timestamp < startTimestamp || timestamp >= endTimestamp) {
        throw errorMessage("La consulta de facturas contiene fechas fuera del periodo.");
      }
      parseVat(invoice.vat);
      ids.add(invoice.id);
      invoices.push(invoice);
    }
    if (invoices.length === pageCount) break;
    if (rows.length === 0 || invoices.length > pageCount) {
      throw errorMessage("La consulta de facturas quedó incompleta.");
    }
  }
  if (expectedCount === null || invoices.length !== expectedCount) {
    throw errorMessage("La consulta de facturas superó el límite de páginas o quedó incompleta.");
  }
  const gaining = getVatScopeMonths(year, "eventos").map((month) => ({
    month,
    totalAmount: 0,
    totalVAT: invoices
      .filter((invoice) => getUtcMonth(invoice.created_at) === month)
      .reduce((total, invoice) => total + parseVat(invoice.vat), 0),
  }));
  return { expenses: [], gaining };
};

export const fetchScopedVatStatistics = async (year: number, scope: VatScope): Promise<VatStatistics> => {
  validateScope(year, scope);
  const legacy = await fetchVatStatistics(year);
  const expenses = validateLegacyRows(legacy.expenses, "gastos");
  const months = getVatScopeMonths(year, scope);
  if (scope === "historical") {
    const gaining = validateLegacyRows(legacy.gaining, "ingresos");
    return { expenses: expenses.filter((row) => months.includes(row.month)), gaining: gaining.filter((row) => months.includes(row.month)) };
  }
  const eventos = await fetchEventosVatStatistics(year);
  return { expenses: expenses.filter((row) => months.includes(row.month)), gaining: eventos.gaining };
};
