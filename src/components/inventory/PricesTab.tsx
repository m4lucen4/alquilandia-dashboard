import { type FC, useMemo, useState } from "react";
import { useFieldArray, type Control } from "react-hook-form";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { InventoryFormValues } from "./ModalInventory";

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Monday-first: getDay() 0=Sun→6, 1=Mon→0, ..., 6=Sat→5
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const days: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);

  return days;
}

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Maps display index (0=L,1=M,...,5=S,6=D) to Date.getDay() value
const DISPLAY_IDX_TO_GETDAY = [1, 2, 3, 4, 5, 6, 0];

interface PricesTabProps {
  control: Control<InventoryFormValues>;
}

export const PricesTab: FC<PricesTabProps> = ({ control }) => {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "priceExceptionList",
  });

  const today = toDateString(new Date());
  const now = new Date();

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [stagedDates, setStagedDates] = useState<Set<string>>(new Set());
  const [newPrice, setNewPrice] = useState<number | "">(0);
  const [bulkWeekdays, setBulkWeekdays] = useState<Set<number>>(new Set());

  const calendarDays = useMemo(
    () => getCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const exceptionDateSet = useMemo(
    () => new Set(fields.map((f) => f.date)),
    [fields],
  );

  // Sorted descending: future dates first, oldest past at bottom
  const sortedFields = useMemo(
    () =>
      [...fields]
        .map((f, idx) => ({ ...f, idx }))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [fields],
  );

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDayClick = (date: Date) => {
    const str = toDateString(date);
    if (exceptionDateSet.has(str)) {
      const idx = fields.findIndex((f) => f.date === str);
      if (idx >= 0) remove(idx);
    } else if (stagedDates.has(str)) {
      setStagedDates((prev) => {
        const next = new Set(prev);
        next.delete(str);
        return next;
      });
    } else {
      setStagedDates((prev) => new Set(prev).add(str));
    }
  };

  const handleAssignPrice = () => {
    const price = typeof newPrice === "number" ? newPrice : 0;
    stagedDates.forEach((dateStr) => {
      const existingIdx = fields.findIndex((f) => f.date === dateStr);
      if (existingIdx >= 0) {
        update(existingIdx, { date: dateStr, price });
      } else {
        append({ date: dateStr, price });
      }
    });
    setStagedDates(new Set());
  };

  const toggleBulkWeekday = (displayIdx: number) => {
    setBulkWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(displayIdx)) next.delete(displayIdx);
      else next.add(displayIdx);
      return next;
    });
  };

  const handleBulkSelect = () => {
    if (bulkWeekdays.size === 0) return;
    const toAdd = new Set(stagedDates);
    calendarDays.forEach((date) => {
      if (!date) return;
      const displayIdx = DISPLAY_IDX_TO_GETDAY.indexOf(date.getDay());
      const str = toDateString(date);
      if (bulkWeekdays.has(displayIdx) && !exceptionDateSet.has(str)) {
        toAdd.add(str);
      }
    });
    setStagedDates(toAdd);
  };

  const getDayClass = (date: Date): string => {
    const str = toDateString(date);
    const base =
      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium cursor-pointer select-none transition-colors focus:outline-none";
    if (exceptionDateSet.has(str)) return `${base} bg-blue-600 text-white hover:bg-blue-700`;
    if (stagedDates.has(str)) return `${base} bg-amber-400 text-white hover:bg-amber-500`;
    if (str === today) return `${base} ring-2 ring-blue-400 text-blue-700 hover:bg-blue-50`;
    return `${base} text-gray-700 hover:bg-gray-100`;
  };

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-gray-900">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 text-center">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="text-xs font-medium text-gray-400">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {calendarDays.map((date, i) => (
            <div key={i} className="flex items-center justify-center">
              {date ? (
                <button
                  type="button"
                  onClick={() => handleDayClick(date)}
                  className={getDayClass(date)}
                >
                  {date.getDate()}
                </button>
              ) : (
                <div className="h-8 w-8" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-blue-600" />
          Precio asignado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-amber-400" />
          Seleccionada
        </span>
      </div>

      {/* Bulk weekday selector */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
        <p className="mb-2 text-xs font-medium text-gray-600">
          Selección rápida — mes en vista
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {WEEKDAY_LABELS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleBulkWeekday(i)}
              className={[
                "h-8 w-8 rounded-full text-xs font-semibold transition-colors focus:outline-none",
                bulkWeekdays.has(i)
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBulkSelect}
            disabled={bulkWeekdays.size === 0}
            className="ml-auto rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            Seleccionar en este mes
          </button>
        </div>
      </div>

      {/* Price input + assign */}
      <div className="flex items-end gap-3">
        <div className="w-36">
          <label className="block text-sm/6 font-medium text-gray-900">
            Precio especial (€)
          </label>
          <input
            type="number"
            min={0}
            value={newPrice}
            onChange={(e) =>
              setNewPrice(
                e.target.value === ""
                  ? ""
                  : Number.parseFloat(e.target.value) || 0,
              )
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={handleAssignPrice}
          disabled={stagedDates.size === 0}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Asignar a {stagedDates.size} fecha
          {stagedDates.size !== 1 ? "s" : ""}
        </button>
      </div>

      {/* Sorted list */}
      {sortedFields.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-gray-600">
            {sortedFields.length} precio
            {sortedFields.length !== 1 ? "s" : ""} especial
            {sortedFields.length !== 1 ? "es" : ""}
          </p>
          <ul className="max-h-44 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
            {sortedFields.map(({ idx, date, price }) => (
              <li
                key={idx}
                className={[
                  "flex items-center justify-between px-3 py-2",
                  date < today ? "opacity-60" : "",
                ].join(" ")}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDateLabel(date)}
                  </p>
                  <p className="text-xs text-gray-500">{price} €</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none"
                  aria-label="Eliminar precio especial"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
