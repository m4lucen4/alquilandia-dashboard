import type {
  AdviserStatisticsRow,
  InventoryStatisticsRow,
  MonthlyAmount,
  VatMonthlyAmount,
  VatStatistics,
} from "@/types/statistics";

export const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;

const toNumber = (value: number): number => Number.isFinite(value) ? value : 0;

export const normalizeMonthlyAmounts = (rows: MonthlyAmount[] | null): MonthlyAmount[] =>
  Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return {
      month,
      totalAmount: (rows ?? [])
        .filter((row) => row.month === month)
        .reduce((total, row) => total + toNumber(row.totalAmount), 0),
    };
  });

const normalizeVatRows = (rows: VatMonthlyAmount[]): VatMonthlyAmount[] =>
  Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return rows.filter((row) => row.month === month).reduce(
      (total, row) => ({
        month,
        totalAmount: total.totalAmount + toNumber(row.totalAmount),
        totalVAT: total.totalVAT + toNumber(row.totalVAT),
      }),
      { month, totalAmount: 0, totalVAT: 0 },
    );
  });

export interface VatDisplayRow {
  month: number;
  incomeVat: number;
  expenseVat: number;
  balance: number;
}

export const getVatDisplayRows = (statistics: VatStatistics): VatDisplayRow[] => {
  const expenses = normalizeVatRows(statistics.expenses);
  const gaining = normalizeVatRows(statistics.gaining);

  return expenses.map((expense, index) => {
    const income = gaining[index];
    const incomeVat = income.totalVAT - income.totalAmount;
    const expenseVat = expense.totalAmount - expense.totalVAT;
    return { month: expense.month, incomeVat, expenseVat, balance: incomeVat - expenseVat };
  });
};

export interface VatQuarterRow {
  label: string;
  incomeVat: number;
  expenseVat: number;
  balance: number;
}

export const getVatQuarterRows = (rows: VatDisplayRow[]): VatQuarterRow[] =>
  ["Primer", "Segundo", "Tercer", "Cuarto"].map((label, index) => {
    const quarter = rows.slice(index * 3, index * 3 + 3);
    return quarter.reduce(
      (total, row) => ({
        label: `${label} trimestre`,
        incomeVat: total.incomeVat + row.incomeVat,
        expenseVat: total.expenseVat + row.expenseVat,
        balance: total.balance + row.balance,
      }),
      { label: `${label} trimestre`, incomeVat: 0, expenseVat: 0, balance: 0 },
    );
  });

export const getScopedVatQuarterRows = (rows: VatDisplayRow[]): VatQuarterRow[] => {
  const quarters = new Map<number, VatQuarterRow>();
  rows.forEach((row) => {
    const quarter = Math.floor((row.month - 1) / 3) + 1;
    const existing = quarters.get(quarter) ?? {
      label: `${["Primer", "Segundo", "Tercer", "Cuarto"][quarter - 1]} trimestre`,
      incomeVat: 0,
      expenseVat: 0,
      balance: 0,
    };
    existing.incomeVat += row.incomeVat;
    existing.expenseVat += row.expenseVat;
    existing.balance += row.balance;
    quarters.set(quarter, existing);
  });
  return Array.from(quarters.values());
};

export const getInventoryTotalCost = (rows: InventoryStatisticsRow[]): number =>
  rows.reduce((total, row) => total + toNumber(row.price), 0);

export const sortInventoryByCategory = (rows: InventoryStatisticsRow[]): InventoryStatisticsRow[] =>
  [...rows].sort((first, second) =>
    (first.subcategory?.nombre ?? "").localeCompare(second.subcategory?.nombre ?? "", "es"),
  );

export const getMonthlyAmountTotal = (rows: MonthlyAmount[]): number =>
  rows.reduce((total, row) => total + toNumber(row.totalAmount), 0);

export interface AdviserGroup {
  key: string;
  seriesKey: string;
  label: string;
  monthlyAmounts: MonthlyAmount[];
  annualTotal: number;
  isAnomaly: boolean;
}

const applicationGeneratedLabel = "Generado por la aplicación";

const getAdviserName = (row: AdviserStatisticsRow): string =>
  `${row.technician.firstName} ${row.technician.lastName}`.trim();

const isApplicationGenerated = (row: AdviserStatisticsRow): boolean =>
  !row.technician.id
  && !row.technicianEmailHash
  && getAdviserName(row) === applicationGeneratedLabel;

export const groupAdviserStatistics = (rows: AdviserStatisticsRow[]): AdviserGroup[] => {
  const idByHash = new Map<string, string>();
  rows.forEach((row) => {
    if (row.technician.id && row.technicianEmailHash) {
      idByHash.set(row.technicianEmailHash, row.technician.id);
    }
  });

  const groupedRows = new Map<string, {
    name: string;
    amounts: number[];
    isAnomaly: boolean;
  }>();

  rows.forEach((row, index) => {
    const name = getAdviserName(row);
    const knownId = row.technician.id || (row.technicianEmailHash ? idByHash.get(row.technicianEmailHash) : "");
    const key = knownId
      ? `adviser:${knownId}`
      : row.technicianEmailHash
        ? `fallback:${row.technicianEmailHash}`
        : isApplicationGenerated(row)
          ? "application"
          : `anomaly:${index}`;
    const existing = groupedRows.get(key) ?? {
      name: isApplicationGenerated(row) ? applicationGeneratedLabel : name,
      amounts: Array.from({ length: 12 }, () => 0),
      isAnomaly: key.startsWith("anomaly:"),
    };

    if (row.month >= 1 && row.month <= 12) {
      existing.amounts[row.month - 1] += toNumber(row.totalAmount);
    }
    groupedRows.set(key, existing);
  });

  const nameCounts = new Map<string, number>();
  return Array.from(groupedRows.entries())
    .sort(([firstKey, first], [secondKey, second]) =>
      first.name.localeCompare(second.name, "es") || firstKey.localeCompare(secondKey),
    )
    .map(([key, group], index) => {
      const count = (nameCounts.get(group.name) ?? 0) + 1;
      nameCounts.set(group.name, count);
      const duplicateNameCount = Array.from(groupedRows.values())
        .filter((candidate) => candidate.name === group.name).length;
      const label = group.isAnomaly
        ? `${group.name || "Asesor sin identificar"} (identidad sin identificar ${count})`
        : duplicateNameCount > 1
          ? `${group.name} (${count})`
          : group.name || "Asesor sin identificar";
      const monthlyAmounts = group.amounts.map((totalAmount, monthIndex) => ({
        month: monthIndex + 1,
        totalAmount,
      }));

      return {
        key,
        seriesKey: `series_${index}`,
        label,
        monthlyAmounts,
        annualTotal: getMonthlyAmountTotal(monthlyAmounts),
        isAnomaly: group.isAnomaly,
      };
    });
};

export const getAdviserChartRows = (groups: AdviserGroup[]): Array<Record<string, number | string>> =>
  monthNames.map((month, monthIndex) => groups.reduce<Record<string, number | string>>(
    (row, group) => ({ ...row, [group.seriesKey]: group.monthlyAmounts[monthIndex].totalAmount }),
    { month },
  ));

export const getAdviserRevenueTotal = (groups: AdviserGroup[]): number =>
  groups.reduce((total, group) => total + group.annualTotal, 0);

export const formatEuro = (value: number): string =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
