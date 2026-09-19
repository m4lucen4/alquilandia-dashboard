import { useEffect, useMemo, useRef, useState, type FC } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ColumnDef } from "@tanstack/react-table";
import type { TooltipContentProps } from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { Table } from "@/components/shared/Table";
import { StatisticsResourceState } from "@/components/accounting/StatisticsResourceState";
import { StatisticsSummaryCard } from "@/components/accounting/StatisticsSummaryCard";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAdviserStatisticsThunk,
  fetchInventoryStatisticsThunk,
  fetchMoneyStatisticsThunk,
  fetchVatStatisticsThunk,
} from "@/redux/actions/statistics";
import {
  formatEuro,
  getAdviserChartRows,
  getAdviserRevenueTotal,
  getInventoryTotalCost,
  getMonthlyAmountTotal,
  getVatDisplayRows,
  getScopedVatQuarterRows,
  monthNames,
  normalizeMonthlyAmounts,
  groupAdviserStatistics,
} from "@/components/accounting/statisticsUtils";
import type { AdviserGroup } from "@/components/accounting/statisticsUtils";
import type { InventoryStatisticsRow, VatScope } from "@/types/statistics";

const yearSchema = z.object({ year: z.number().int().min(2017).max(2099) });
type YearFormValues = z.infer<typeof yearSchema>;
const vatFormSchema = yearSchema.extend({ scope: z.enum(["eventos", "historical"]) });
type VatFormValues = z.infer<typeof vatFormSchema>;
type TabId = "money" | "adviser" | "inventory" | "vat";
type InventorySortKey = "category" | "cost";
type SortDirection = "ascending" | "descending";

const tabs: { id: TabId; label: string }[] = [
  { id: "money", label: "Ingresos y gastos" },
  { id: "adviser", label: "Asesores" },
  { id: "inventory", label: "Inventario" },
  { id: "vat", label: "IVA" },
];

const years = Array.from({ length: 83 }, (_, index) => index + 2017);

export const Statistics: FC = () => {
  const dispatch = useAppDispatch();
  const {
    money,
    adviser,
    inventory,
    vat,
    vatMetadata,
    fetchMoneyRequest,
    fetchAdviserRequest,
    fetchInventoryRequest,
    fetchVatRequest,
  } = useAppSelector((state) => state.statistics);
  const [activeTab, setActiveTab] = useState<TabId>("money");
  const [inventorySort, setInventorySort] = useState<{
    key: InventorySortKey;
    direction: SortDirection;
  }>({ key: "category", direction: "ascending" });
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    money: null,
    adviser: null,
    inventory: null,
    vat: null,
  });
  const { control } = useForm<YearFormValues>({
    resolver: zodResolver(yearSchema),
    defaultValues: { year: new Date().getFullYear() },
  });
  const year = useWatch({ control, name: "year" }) ?? new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  const { control: vatControl, setValue: setVatValue } = useForm<VatFormValues>({
    resolver: zodResolver(vatFormSchema),
    defaultValues: { year: currentYear, scope: currentYear >= 2026 ? "eventos" : "historical" },
  });
  const vatYear = useWatch({ control: vatControl, name: "year" }) ?? currentYear;
  const vatScope = useWatch({ control: vatControl, name: "scope" }) ?? "eventos";
  const validVatScope: VatScope = vatYear < 2026
    ? "historical"
    : vatYear > 2026
      ? "eventos"
      : vatScope;
  const isVatForSelection = vatMetadata?.year === vatYear && vatMetadata.scope === validVatScope;

  useEffect(() => {
    dispatch(fetchMoneyStatisticsThunk(year));
    dispatch(fetchAdviserStatisticsThunk(year));
  }, [dispatch, year]);

  useEffect(() => {
    if (vatScope !== validVatScope) setVatValue("scope", validVatScope);
  }, [setVatValue, validVatScope, vatScope]);

  useEffect(() => {
    if (activeTab === "vat" && vatScope === validVatScope) {
      dispatch(fetchVatStatisticsThunk({ year: vatYear, scope: validVatScope }));
    }
  }, [activeTab, dispatch, validVatScope, vatScope, vatYear]);

  useEffect(() => {
    dispatch(fetchInventoryStatisticsThunk());
  }, [dispatch]);

  const moneyRows = useMemo(() => {
    if (!money) return [];

    const expenses = normalizeMonthlyAmounts(money.expenses);
    const gaining = normalizeMonthlyAmounts(money.gaining);

    return expenses.map((expense, index) => ({
      month: monthNames[index],
      ingresos: gaining[index].totalAmount,
      gastos: expense.totalAmount,
    }));
  }, [money]);
  const vatRows = useMemo(
    () => (vat && isVatForSelection ? getVatDisplayRows(vat).filter((row) => vatScopeMonths(vatYear, validVatScope).includes(row.month)) : []),
    [isVatForSelection, validVatScope, vat, vatYear],
  );
  const vatQuarterRows = useMemo(() => getScopedVatQuarterRows(vatRows), [vatRows]);
  const adviserGroups = useMemo(
    () => groupAdviserStatistics(Array.isArray(adviser) ? adviser : []),
    [adviser],
  );
  const adviserChartRows = useMemo(() => getAdviserChartRows(adviserGroups), [adviserGroups]);
  const sortedInventory = useMemo(() => {
    const direction = inventorySort.direction === "ascending" ? 1 : -1;

    return [...inventory].sort((first, second) => {
      if (inventorySort.key === "cost") return (first.price - second.price) * direction;

      return (first.subcategory?.nombre ?? "").localeCompare(
        second.subcategory?.nombre ?? "",
        "es",
      ) * direction;
    });
  }, [inventory, inventorySort]);

  const activateTab = (tabId: TabId, focus = false) => {
    setActiveTab(tabId);
    if (focus) tabRefs.current[tabId]?.focus();
  };

  const toggleInventorySort = (key: InventorySortKey) => {
    setInventorySort((current) => ({
      key,
      direction: current.key === key && current.direction === "ascending"
        ? "descending"
        : "ascending",
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Estadísticas"
          description="Consulta la evolución financiera, comercial y de inventario."
        />
        {activeTab !== "inventory" && activeTab !== "vat" && (
          <form noValidate className="w-full sm:w-44">
            <Controller
              name="year"
              control={control}
              render={({ field }) => (
                <label className="block text-sm font-medium text-gray-700">
                  Año
                  <select
                    {...field}
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {years.map((availableYear) => (
                      <option key={availableYear} value={availableYear}>
                        {availableYear}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            />
          </form>
        )}
      </div>

      <div
        className="border-b border-gray-200"
        role="tablist"
        aria-label="Secciones de estadísticas"
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

          event.preventDefault();
          const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
          const direction = event.key === "ArrowRight" ? 1 : -1;
          const nextTab = tabs[(currentIndex + direction + tabs.length) % tabs.length];
          activateTab(nextTab.id, true);
        }}
      >
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(element) => { tabRefs.current[tab.id] = element; }}
              id={`${tab.id}-tab`}
              type="button"
              role="tab"
              aria-controls={`${tab.id}-panel`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              aria-selected={activeTab === tab.id}
              onClick={() => activateTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "money" && (
        <section
          id="money-panel"
          role="tabpanel"
          aria-labelledby="money-tab"
          aria-label="Estadística de ingresos y gastos"
          className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900">Ingresos y gastos — {year}</h2>
          <StatisticsResourceState
            request={fetchMoneyRequest}
            hasData={money !== null && (money.expenses.length > 0 || money.gaining.length > 0)}
            emptyMessage="No hay estadísticas para el año seleccionado."
            onRetry={() => dispatch(fetchMoneyStatisticsThunk(year))}
          >
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatisticsSummaryCard
                label="Ingresos"
                value={formatEuro(getMonthlyAmountTotal(money?.gaining ?? []))}
                tone="green"
              />
              <StatisticsSummaryCard
                label="Gastos"
                value={formatEuro(getMonthlyAmountTotal(money?.expenses ?? []))}
                tone="red"
              />
              <StatisticsSummaryCard
                label="Balance"
                value={formatEuro(
                  getMonthlyAmountTotal(money?.gaining ?? [])
                    - getMonthlyAmountTotal(money?.expenses ?? []),
                )}
                tone="blue"
              />
            </div>
            <div className="mt-6 h-80 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moneyRows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatEuro} tick={{ fontSize: 12 }} width={80} />
                  <Tooltip formatter={(value) => formatEuro(Number(value))} />
                  <Legend />
                  <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" />
                  <Bar dataKey="gastos" name="Gastos" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </StatisticsResourceState>
        </section>
      )}

      {activeTab === "adviser" && (
        <section
          id="adviser-panel"
          role="tabpanel"
          aria-labelledby="adviser-tab"
          aria-label="Estadística de asesores"
          className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900">Ingresos por asesor — {year}</h2>
          <StatisticsResourceState
            request={fetchAdviserRequest}
            hasData={adviser.length > 0}
            emptyMessage="No hay estadísticas para el año seleccionado."
            onRetry={() => dispatch(fetchAdviserStatisticsThunk(year))}
          >
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <StatisticsSummaryCard
                label="Ingresos de asesores"
                value={formatEuro(getAdviserRevenueTotal(adviserGroups))}
                tone="blue"
              />
              <StatisticsSummaryCard label="Asesores" value={String(adviserGroups.length)} tone="violet" />
            </div>
            <div className="mt-6 h-80 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adviserChartRows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatEuro} width={80} />
                  <Tooltip content={(props) => <AdviserTooltip {...props} groups={adviserGroups} />} />
                  <Legend />
                  {adviserGroups.map((group, index) => (
                    <Bar
                      key={group.key}
                      dataKey={group.seriesKey}
                      name={group.label}
                      fill={adviserColors[index % adviserColors.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Table
              data={adviserGroups}
              columns={adviserColumns}
              isLoading={false}
              emptyMessage="No hay asesores para el año seleccionado"
            />
          </StatisticsResourceState>
        </section>
      )}

      {activeTab === "inventory" && (
        <section
          id="inventory-panel"
          role="tabpanel"
          aria-labelledby="inventory-tab"
          aria-label="Estadística de inventario"
          className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900">Estadística de inventario</h2>
          <StatisticsResourceState
            request={fetchInventoryRequest}
            hasData={inventory.length > 0}
            emptyMessage="No hay artículos de inventario."
            onRetry={() => dispatch(fetchInventoryStatisticsThunk())}
          >
            <div className="mt-5">
              <StatisticsSummaryCard
                label="Coste total"
                value={formatEuro(getInventoryTotalCost(inventory))}
                tone="violet"
              />
            </div>
            <div className="mt-6">
              <Table
                data={sortedInventory}
                columns={getInventoryColumns(inventorySort, toggleInventorySort)}
                isLoading={false}
                emptyMessage="No hay artículos de inventario"
              />
            </div>
          </StatisticsResourceState>
        </section>
      )}

      {activeTab === "vat" && (
        <section
          id="vat-panel"
          role="tabpanel"
          aria-labelledby="vat-tab"
          aria-label="Relación de IVA"
          className="space-y-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Relación de IVA — {vatYear}</h2>
            <form noValidate className="grid gap-3 sm:grid-cols-2">
              <VatSelect control={vatControl} name="year" label="Año" options={years.map((value) => ({ value, label: String(value) }))} />
              <VatSelect
                control={vatControl}
                name="scope"
                label="Ámbito"
                options={(vatYear > 2026 ? [{ value: "eventos", label: "Alquilandia Eventos" }] : [
                  { value: "eventos", label: "Alquilandia Eventos" },
                  { value: "historical", label: "Histórico anterior al corte" },
                ])}
              />
            </form>
          </div>
          <p className="text-sm text-gray-600">Balance calculado; no incluye compensaciones ni ajustes de deducción.</p>
          <StatisticsResourceState
            request={fetchVatRequest}
            hasData={isVatForSelection && vat !== null && (vat.expenses.length > 0 || vat.gaining.length > 0)}
            emptyMessage="No hay estadísticas para el año seleccionado."
            onRetry={() => dispatch(fetchVatStatisticsThunk({ year: vatYear, scope: validVatScope }))}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <StatisticsSummaryCard
                label="IVA ingresos"
                value={formatEuro(vatRows.reduce((total, row) => total + row.incomeVat, 0))}
                tone="green"
              />
              <StatisticsSummaryCard
                label="IVA gastos"
                value={formatEuro(vatRows.reduce((total, row) => total + row.expenseVat, 0))}
                tone="red"
              />
              <StatisticsSummaryCard
                label="Diferencia"
                value={formatEuro(vatRows.reduce((total, row) => total + row.balance, 0))}
                tone="blue"
              />
            </div>
            <VatTable
              title="Detalle mensual"
              rows={vatRows.map((row) => ({ label: monthNames[row.month - 1], ...row }))}
            />
            <VatTable title="Resumen trimestral" rows={vatQuarterRows} />
            {vatQuarterRows.some((row) => isCurrentQuarter(row.label, vatYear)) && (
              <p className="text-sm text-amber-700">El trimestre abierto es provisional.</p>
            )}
          </StatisticsResourceState>
        </section>
      )}
    </div>
  );
};

const adviserColors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

const vatScopeMonths = (year: number, scope: VatScope): number[] => {
  const first = year === 2026 && scope === "eventos" ? 7 : 1;
  const last = year === 2026 && scope === "historical" ? 6 : 12;
  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
};

const isCurrentQuarter = (label: string, year: number): boolean => {
  const quarter = ["Primer", "Segundo", "Tercer", "Cuarto"].findIndex((value) => label.startsWith(value)) + 1;
  return year === new Date().getFullYear() && quarter === Math.floor(new Date().getMonth() / 3) + 1;
};

const VatSelect: FC<{
  control: ReturnType<typeof useForm<VatFormValues>>["control"];
  name: "year" | "scope";
  label: string;
  options: { value: number | VatScope; label: string }[];
}> = ({ control, name, label, options }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <select
          {...field}
          value={field.value}
          onChange={(event) => field.onChange(name === "year" ? Number(event.target.value) : event.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
    )}
  />
);

const adviserColumns: ColumnDef<AdviserGroup>[] = [
  {
    id: "adviser",
    header: "Asesor",
    cell: ({ row }) => (
      <span className="block whitespace-normal break-words">
        {row.original.label}
      </span>
    ),
  },
  {
    id: "revenue",
    header: "Ingresos",
    cell: ({ row }) => <span className="tabular-nums">{formatEuro(row.original.annualTotal)}</span>,
  },
];

const getInventoryColumns = (
  sort: { key: InventorySortKey; direction: SortDirection },
  onToggle: (key: InventorySortKey) => void,
): ColumnDef<InventoryStatisticsRow>[] => [
  {
    id: "category",
    header: () => (
      <InventorySortButton
        label="Categoría"
        isActive={sort.key === "category"}
        direction={sort.direction}
        onClick={() => onToggle("category")}
      />
    ),
    cell: ({ row }) => (
      <span className="block whitespace-normal break-words">
        {row.original.subcategory?.nombre || "SIN CATEGORÍA"}
      </span>
    ),
  },
  {
    id: "cost",
    header: () => (
      <InventorySortButton
        label="Coste"
        isActive={sort.key === "cost"}
        direction={sort.direction}
        onClick={() => onToggle("cost")}
      />
    ),
    cell: ({ row }) => <span className="tabular-nums">{formatEuro(row.original.price)}</span>,
  },
];

const InventorySortButton: FC<{
  label: string;
  isActive: boolean;
  direction: SortDirection;
  onClick: () => void;
}> = ({ label, isActive, direction, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {label} {isActive ? (direction === "ascending" ? "↑" : "↓") : "↕"}
  </button>
);

const AdviserTooltip: FC<Partial<TooltipContentProps> & { groups: AdviserGroup[] }> = ({
  active,
  payload,
  label,
  groups,
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-gray-900">{label}</p>
      {payload.map((entry) => {
        const group = groups.find((candidate) => candidate.seriesKey === entry.dataKey);
        if (!group) return null;

        return (
          <p key={group.key} className="mt-1 text-gray-600">
            {group.label}: {formatEuro(Number(entry.value) || 0)}
          </p>
        );
      })}
    </div>
  );
};

const VatTable: FC<{
  title: string;
  rows: { label: string; incomeVat: number; expenseVat: number; balance: number }[];
}> = ({ title, rows }) => (
  <div>
    <h3 className="text-base font-semibold text-gray-800">{title}</h3>
    <div className="mt-3 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">Periodo</th>
            <th className="px-3 py-2 text-right">IVA ingresos</th>
            <th className="px-3 py-2 text-right">IVA gastos</th>
            <th className="px-3 py-2 text-right">Diferencia</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t">
              <td className="px-3 py-2">{row.label}</td>
              <td className="px-3 py-2 text-right tabular-nums">{formatEuro(row.incomeVat)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{formatEuro(row.expenseVat)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{formatEuro(row.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Statistics;
