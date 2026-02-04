import { type FC } from "react";
import Button from "../shared/Button";
import InputField from "../shared/InputField";

interface SearchBudgetsProps {
  budgetNumber: string;
  setBudgetNumber: (value: string) => void;
  clientName: string;
  setClientName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  appliedFilters: {
    budgetNumber: string;
    clientName: string;
    phone: string;
  };
  isLoading?: boolean;
}

export const SearchBudgets: FC<SearchBudgetsProps> = ({
  budgetNumber,
  setBudgetNumber,
  clientName,
  setClientName,
  phone,
  setPhone,
  onSearch,
  onClearFilters,
  appliedFilters,
  isLoading = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="mt-6 rounded-lg bg-white p-4 shadow ring-1 ring-black/5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Input Número de Presupuesto */}
        <InputField
          label="Nº Presupuesto"
          name="budgetNumber"
          value={budgetNumber}
          onChange={(e) => setBudgetNumber(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ej: 12345"
          disabled={isLoading}
        />

        {/* Input Cliente */}
        <InputField
          label="Cliente"
          name="clientName"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nombre del cliente"
          disabled={isLoading}
        />

        {/* Input Teléfono */}
        <InputField
          label="Teléfono"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Teléfono"
          disabled={isLoading}
        />

        {/* Botones */}
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
          <Button
            title="Buscar"
            onClick={onSearch}
            disabled={isLoading}
            variant="primary"
            size="md"
            block
            type="button"
          />
          <Button
            title="Limpiar"
            onClick={onClearFilters}
            disabled={isLoading}
            variant="secondary"
            size="md"
            block
            type="button"
          />
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {(appliedFilters.budgetNumber ||
        appliedFilters.clientName ||
        appliedFilters.phone) && (
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
        </div>
      )}
    </div>
  );
};
