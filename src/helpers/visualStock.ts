import type { Budget, BudgetLine } from "@/types/budgets";
import type {
  VisualStockExtra,
  VisualStockExtraBudget,
  VisualStockExtraSource,
  VisualStockProduct,
  VisualStockProductSource,
} from "@/types/visualStock";

export const aggregateVisualStockProducts = (
  products: VisualStockProductSource[],
): VisualStockProduct[] => {
  const grouped = new Map<string, VisualStockProduct>();

  products.forEach((product) => {
    const current = grouped.get(product.name);
    if (current) {
      grouped.set(product.name, {
        ...current,
        units: current.units + product.units,
        budgets: [...current.budgets, ...product.budgets],
        products:
          current.products.length === 0 && product.products?.length
            ? product.products
            : current.products,
      });
      return;
    }

    grouped.set(product.name, {
      ...product,
      unidades: product.unidades ?? 0,
      products: product.products ?? [],
      budgets: [...product.budgets],
    });
  });

  return [...grouped.values()];
};

export const aggregateVisualStockExtras = (
  extras: VisualStockExtraSource[],
): VisualStockExtra[] => {
  const grouped = new Map<string, VisualStockExtra>();

  extras.forEach((extra) => {
    const current = grouped.get(extra.extraName);
    if (current) {
      grouped.set(extra.extraName, {
        ...current,
        units: current.units + extra.units,
        budgets: [...current.budgets, extra.budget],
      });
      return;
    }

    grouped.set(extra.extraName, {
      id: extra.id,
      extraName: extra.extraName,
      units: extra.units,
      budgets: [extra.budget],
    });
  });

  return [...grouped.values()];
};

export const getProductBudgetUnits = (
  line: BudgetLine,
  productName: string,
  products: BudgetLine[],
): number => {
  const matchingProduct = products.find((product) => product.elemento === productName);
  const isPackLine = Boolean(line.packId) && !line.objetoid;

  return isPackLine && matchingProduct ? line.units * matchingProduct.units : line.units;
};

export const aggregateExtraBudgetRows = (
  budgets: Budget[],
  extraName: string,
): VisualStockExtraBudget[] => {
  const grouped = new Map<string, VisualStockExtraBudget>();

  budgets.forEach((budget) => {
    const extraUnits = (budget.budgetLines ?? []).reduce(
      (total, line) =>
        total +
        (line.extras ?? [])
          .filter((extra) => extra.extraName === extraName)
          .reduce((lineTotal, extra) => lineTotal + extra.units, 0),
      0,
    );
    const key = String(budget.budgetReference || budget.id);
    const current = grouped.get(key);

    if (current) {
      grouped.set(key, { ...current, extraUnits: current.extraUnits + extraUnits });
      return;
    }

    grouped.set(key, { ...budget, extraUnits });
  });

  return [...grouped.values()];
};
