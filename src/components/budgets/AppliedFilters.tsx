import { type FC } from "react";
import { getStatusBadgeConfig } from "@/helpers";
import { formatDateForDisplay } from "@/helpers/budgets";
import type { AppliedFiltersType } from "@/types/budgets";

interface AppliedFiltersProps {
  appliedFilters: AppliedFiltersType;
}

export const AppliedFilters: FC<AppliedFiltersProps> = ({ appliedFilters }) => {
  const hasActiveFilters =
    appliedFilters.budgetNumber ||
    appliedFilters.clientName ||
    appliedFilters.phone ||
    appliedFilters.status ||
    appliedFilters.address ||
    appliedFilters.eventDateFrom ||
    appliedFilters.eventDateTo ||
    appliedFilters.creationDateFrom ||
    appliedFilters.creationDateTo;

  if (!hasActiveFilters) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-600">Filtros activos:</span>
      {appliedFilters.budgetNumber && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Nº {appliedFilters.budgetNumber}
        </span>
      )}
      {appliedFilters.clientName && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Cliente: {appliedFilters.clientName}
        </span>
      )}
      {appliedFilters.phone && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Teléfono: {appliedFilters.phone}
        </span>
      )}
      {appliedFilters.status && (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            getStatusBadgeConfig(appliedFilters.status).className
          }`}
        >
          {getStatusBadgeConfig(appliedFilters.status).label}
        </span>
      )}
      {appliedFilters.address && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Dirección: {appliedFilters.address}
        </span>
      )}
      {(appliedFilters.eventDateFrom || appliedFilters.eventDateTo) && (
        <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
          Evento:{" "}
          {appliedFilters.eventDateFrom
            ? formatDateForDisplay(appliedFilters.eventDateFrom)
            : "..."}
          {" - "}
          {appliedFilters.eventDateTo
            ? formatDateForDisplay(appliedFilters.eventDateTo)
            : "..."}
        </span>
      )}
      {(appliedFilters.creationDateFrom || appliedFilters.creationDateTo) && (
        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
          Creación:{" "}
          {appliedFilters.creationDateFrom
            ? formatDateForDisplay(appliedFilters.creationDateFrom)
            : "..."}
          {" - "}
          {appliedFilters.creationDateTo
            ? formatDateForDisplay(appliedFilters.creationDateTo)
            : "..."}
        </span>
      )}
    </div>
  );
};
