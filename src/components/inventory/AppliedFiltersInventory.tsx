import { type FC } from "react";
import type { InventoryAppliedFilters } from "@/hooks/useInventorySearch";

interface AppliedFiltersInventoryProps {
  appliedFilters: InventoryAppliedFilters;
}

const VISIBILITY_LABELS: Record<string, string> = {
  true: "Privados",
  false: "Públicos",
};

export const AppliedFiltersInventory: FC<AppliedFiltersInventoryProps> = ({
  appliedFilters,
}) => {
  const hasActiveFilters =
    appliedFilters.visibility ||
    appliedFilters.principal ||
    appliedFilters.categoriaId ||
    appliedFilters.elemento;

  if (!hasActiveFilters) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-600">Filtros activos:</span>
      {appliedFilters.elemento && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Elemento: {appliedFilters.elemento}
        </span>
      )}
      {appliedFilters.visibility && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Visibilidad: {VISIBILITY_LABELS[appliedFilters.visibility]}
        </span>
      )}
      {appliedFilters.principal && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Categoría: {appliedFilters.principal}
        </span>
      )}
      {appliedFilters.categoriaId && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Subcategoría: {appliedFilters.categoriaId}
        </span>
      )}
    </div>
  );
};
