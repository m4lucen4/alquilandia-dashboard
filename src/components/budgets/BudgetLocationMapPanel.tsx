import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/shared/Button";
import DateField from "@/components/shared/DateField";
import { getBudgets } from "@/services/budgetsServices";
import type { Budget } from "@/types/budgets";
import { BudgetLocationMap } from "./BudgetLocationMap";
import { getMapPosition } from "./budgetLocationMap.utils";

interface BudgetLocationMapPanelProps {
  onBudgetSelect: (budget: Budget) => void;
}

type BlockFilter = "all" | "withBlock" | "withoutBlock";

const RESERVATION_STATUSES = new Set([
  "PAID",
  "PAID25",
  "TRANSFER_PAID",
  "RESERVED",
]);

const toDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDayTimestamp = (date: string): string =>
  new Date(`${date}T00:00:00`).toISOString();

const isIncludedByBlockFilter = (
  budget: Budget,
  blockFilter: BlockFilter,
): boolean => {
  if (blockFilter === "all") return true;

  const expectedBlock = blockFilter === "withBlock" ? 1 : 0;
  return budget.budgetLines.some((line) => line.bloqueo === expectedBlock);
};

export const BudgetLocationMapPanel: FC<BudgetLocationMapPanelProps> = ({
  onBudgetSelect,
}) => {
  const [selectedDate, setSelectedDate] = useState(() =>
    toDateInputValue(new Date()),
  );
  const [appliedDate, setAppliedDate] = useState(selectedDate);
  const [blockFilter, setBlockFilter] = useState<BlockFilter>("all");
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadBudgets = async () => {
      setIsLoading(true);
      setError("");
      try {
        const dayTimestamp = toDayTimestamp(appliedDate);
        const response = await getBudgets({
          pageSize: 0,
          pageToFetch: 0,
          filtersQuery: `eventDateFrom=${dayTimestamp}&eventDateTo=${dayTimestamp}`,
        });
        if (active) setBudgets(response.budgets);
      } catch (requestError) {
        if (active) {
          setBudgets([]);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "No se pudieron cargar los presupuestos del día seleccionado.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadBudgets();

    return () => {
      active = false;
    };
  }, [appliedDate]);

  const mappedBudgets = useMemo(
    () =>
      budgets.filter(
        (budget) =>
          RESERVATION_STATUSES.has(budget.status) &&
          isIncludedByBlockFilter(budget, blockFilter),
      ),
    [budgets, blockFilter],
  );

  const mappableBudgets = useMemo(
    () => mappedBudgets.filter((budget) => getMapPosition(budget.location)),
    [mappedBudgets],
  );

  const handleApplyDate = useCallback(() => {
    setAppliedDate(selectedDate);
  }, [selectedDate]);

  return (
    <section className="mt-6 rounded-lg bg-white p-4 shadow ring-1 ring-black/5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-4 sm:grid-cols-2">
          <DateField
            label="Día de reserva"
            name="budgetMapDate"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            disabled={isLoading}
            required
          />
          <label className="block text-sm/6 font-medium text-gray-900">
            Filtrar por bloqueo
            <select
              value={blockFilter}
              onChange={(event) =>
                setBlockFilter(event.target.value as BlockFilter)
              }
              disabled={isLoading}
              className="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm/6"
            >
              <option value="all">Todos</option>
              <option value="withBlock">Con bloqueo 1</option>
              <option value="withoutBlock">Con bloqueo 0</option>
            </select>
          </label>
        </div>
        <Button
          title="Aplicar filtros"
          onClick={handleApplyDate}
          loading={isLoading}
          disabled={!selectedDate}
          variant="primary"
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <p className="mt-5 text-sm font-medium text-gray-700">
        Mostrando {mappableBudgets.length} presupuestos con ubicación
      </p>

      <div className="mt-3">
        <BudgetLocationMap
          budgets={mappableBudgets}
          onBudgetSelect={onBudgetSelect}
        />
      </div>

      {mappableBudgets.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {mappableBudgets.map((budget) => (
            <button
              key={budget.id}
              type="button"
              onClick={() => onBudgetSelect(budget)}
              className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Presupuesto #{budget.budgetReference}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
