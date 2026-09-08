import { apiClient } from "./api";
import type { Budget, BudgetLine, Extra } from "@/types/budgets";
import type {
  VisualStockDateRange,
  VisualStockExtraSource,
  VisualStockProductSource,
} from "@/types/visualStock";

type LegacyExtra = Omit<Extra, "units"> & { units: number | string };
type LegacyBudgetLine = Omit<BudgetLine, "units" | "extras"> & {
  units: number | string;
  extras?: LegacyExtra[] | null;
};
type LegacyBudget = Omit<Budget, "budgetLines"> & {
  budgetLines?: LegacyBudgetLine | LegacyBudgetLine[] | null;
};
type LegacyVisualStockProductSource = Omit<VisualStockProductSource, "units" | "products" | "budgets"> & {
  units: number | string;
  products?: LegacyBudgetLine[];
  budgets: LegacyBudget[];
};
type LegacyVisualStockExtraSource = Omit<VisualStockExtraSource, "units" | "budget"> & {
  units: number | string;
  budget: LegacyBudget;
};

const normalizeUnits = Number;

const normalizeBudgetLine = (line: LegacyBudgetLine): BudgetLine => ({
  ...line,
  units: normalizeUnits(line.units),
  extras: (line.extras ?? []).map((extra) => ({ ...extra, units: normalizeUnits(extra.units) })),
});

const normalizeBudget = (budget: LegacyBudget): Budget => ({
  ...budget,
  budgetLines: (budget.budgetLines == null
    ? []
    : Array.isArray(budget.budgetLines) ? budget.budgetLines : [budget.budgetLines])
    .map(normalizeBudgetLine),
});

const normalizeVisualStockProducts = (
  products: LegacyVisualStockProductSource[],
): VisualStockProductSource[] =>
  products.map((product) => ({
    ...product,
    units: normalizeUnits(product.units),
    products: product.products?.map(normalizeBudgetLine),
    budgets: product.budgets.map(normalizeBudget),
  }));

const normalizeVisualStockExtras = (
  extras: LegacyVisualStockExtraSource[],
): VisualStockExtraSource[] =>
  extras.map((extra) => ({
    ...extra,
    units: normalizeUnits(extra.units),
    budget: normalizeBudget(extra.budget),
  }));

export const serializeVisualStockDateTime = (value: string): string => {
  const localDateTime = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00`
    : value;

  return new Date(localDateTime).toISOString().slice(0, 19);
};

const buildRangeQuery = ({ startDate, endDate }: VisualStockDateRange): string =>
  `start=${serializeVisualStockDateTime(startDate)}&end=${serializeVisualStockDateTime(endDate)}`;

export const getVisualStockProducts = async (
  range: VisualStockDateRange,
): Promise<VisualStockProductSource[]> => {
  const response = await apiClient(`/budgets/stock?${buildRangeQuery(range)}`);
  const products = await response.json() as LegacyVisualStockProductSource[];
  return normalizeVisualStockProducts(products);
};

export const getVisualStockExtras = async (
  range: VisualStockDateRange,
): Promise<VisualStockExtraSource[]> => {
  const response = await apiClient(`/budgets/extras/stock?${buildRangeQuery(range)}`);
  const extras = await response.json() as LegacyVisualStockExtraSource[];
  return normalizeVisualStockExtras(extras);
};
