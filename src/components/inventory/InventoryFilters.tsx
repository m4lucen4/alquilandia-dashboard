import { type FC } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Button from "@/components/shared/Button";
import { AppliedFiltersInventory } from "./AppliedFiltersInventory";
import type { InventoryAppliedFilters } from "@/hooks/useInventorySearch";

interface SubcategoriaOption {
  id: string;
  nombre: string;
}

interface InventoryFiltersProps {
  filterVisibility: "" | "true" | "false";
  filterPrincipal: string;
  filterCategoriaId: string;
  filterElemento: string;
  principalOptions: string[];
  subcategoriaOptions: SubcategoriaOption[];
  appliedFilters: InventoryAppliedFilters;
  isLoading?: boolean;
  onVisibilityChange: (value: "" | "true" | "false") => void;
  onPrincipalChange: (value: string) => void;
  onCategoriaIdChange: (value: string) => void;
  onElementoChange: (value: string) => void;
  onSearch: () => void;
  onClearFilters: () => void;
}

export const InventoryFilters: FC<InventoryFiltersProps> = ({
  filterVisibility,
  filterPrincipal,
  filterCategoriaId,
  filterElemento,
  principalOptions,
  subcategoriaOptions,
  appliedFilters,
  isLoading = false,
  onVisibilityChange,
  onPrincipalChange,
  onCategoriaIdChange,
  onElementoChange,
  onSearch,
  onClearFilters,
}) => {
  const selectClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow ring-1 ring-black/5">
      {/* Fila 1: Elemento, Visibilidad, Buscar, Limpiar */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Elemento
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={filterElemento}
              onChange={(e) => onElementoChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar por elemento..."
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
        </div>

        <div className="min-w-[150px]">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Visibilidad
          </label>
          <select
            value={filterVisibility}
            onChange={(e) =>
              onVisibilityChange(e.target.value as "" | "true" | "false")
            }
            disabled={isLoading}
            className={selectClass}
          >
            <option value="">Todos</option>
            <option value="false">Públicos</option>
            <option value="true">Privados</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <Button
            title="Buscar"
            onClick={onSearch}
            disabled={isLoading}
            variant="primary"
            size="md"
            type="button"
          />
          <Button
            title="Limpiar"
            onClick={onClearFilters}
            disabled={isLoading}
            variant="secondary"
            size="md"
            type="button"
          />
        </div>
      </div>

      {/* Fila 2: Categoría, Subcategoría */}
      <div className="mt-3 flex flex-wrap gap-3">
        <div className="min-w-[200px]">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Categoría
          </label>
          <select
            value={filterPrincipal}
            onChange={(e) => onPrincipalChange(e.target.value)}
            disabled={isLoading}
            className={selectClass}
          >
            <option value="">Todas</option>
            {principalOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[200px]">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Subcategoría
          </label>
          <select
            value={filterCategoriaId}
            onChange={(e) => onCategoriaIdChange(e.target.value)}
            disabled={isLoading || !filterPrincipal}
            className={selectClass}
          >
            <option value="">Todas</option>
            {subcategoriaOptions.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AppliedFiltersInventory appliedFilters={appliedFilters} />
    </div>
  );
};
