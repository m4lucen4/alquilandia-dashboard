import { type FC, useMemo } from "react";
import type { Business } from "@/types/business";
import InputField from "@/components/shared/InputField";
import Button from "@/components/shared/Button";
import SelectField from "@/components/shared/SelectField";

interface SearchInvoicesProps {
  selectedBusinessId: string;
  budgetNumber: string;
  appliedFilters: { businessId: string; budgetNumber: string };
  businesses: Business[];
  isLoading: boolean;
  onBusinessChange: (businessId: string) => void;
  onBudgetNumberChange: (budgetNumber: string) => void;
  onSearch: () => void;
  onClearFilters: () => void;
}

export const SearchInvoices: FC<SearchInvoicesProps> = ({
  selectedBusinessId,
  budgetNumber,
  appliedFilters,
  businesses,
  isLoading,
  onBusinessChange,
  onBudgetNumberChange,
  onSearch,
  onClearFilters,
}) => {
  // Memoize business options to avoid recalculating on every render
  const businessOptions = useMemo(
    () =>
      businesses.map((business) => ({
        value: business.id,
        label: business.name,
      })),
    [businesses],
  );

  return (
    <div className="rounded-lg bg-white p-4 shadow ring-1 ring-black/5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Select Empresa */}
        <SelectField
          label="Empresa"
          name="business-filter"
          value={selectedBusinessId}
          onChange={(e) => onBusinessChange(e.target.value)}
          options={businessOptions}
          placeholder="Todas las empresas"
        />

        {/* Input Número de Presupuesto */}
        <InputField
          label="Nº Presupuesto"
          name="budgetNumber"
          value={budgetNumber}
          onChange={(e) => onBudgetNumberChange(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              onSearch();
            }
          }}
          placeholder="Ej: 12345"
          type="text"
        />

        {/* Botones */}
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2">
          <Button
            title="Buscar"
            onClick={onSearch}
            disabled={isLoading}
            variant="primary"
            size="md"
            block
          />
          <Button
            title="Limpiar"
            onClick={onClearFilters}
            disabled={isLoading}
            variant="secondary"
            size="md"
            block
          />
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {(appliedFilters.businessId || appliedFilters.budgetNumber) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          {appliedFilters.businessId && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              Empresa:{" "}
              {businesses.find((b) => b.id === appliedFilters.businessId)
                ?.name || appliedFilters.businessId}
            </span>
          )}
          {appliedFilters.budgetNumber && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              Nº {appliedFilters.budgetNumber}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
