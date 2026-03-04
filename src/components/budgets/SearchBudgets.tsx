import { type FC } from "react";
import Button from "../shared/Button";
import InputField from "../shared/InputField";
import SelectField from "../shared/SelectField";
import DateRangeField from "../shared/DateRangeField";
import { statusOptions } from "@/constants";
import type { SearchBudgetsProps } from "@/types/budgets";
import { AppliedFilters } from "./AppliedFilters";

export const SearchBudgets: FC<SearchBudgetsProps> = ({
  budgetNumber,
  setBudgetNumber,
  clientName,
  setClientName,
  phone,
  setPhone,
  status,
  setStatus,
  eventDateFrom,
  setEventDateFrom,
  eventDateTo,
  setEventDateTo,
  creationDateFrom,
  setCreationDateFrom,
  creationDateTo,
  setCreationDateTo,
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
      {/* Primera fila: Filtros principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

        {/* Select Estado */}
        <SelectField
          label="Estado"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={statusOptions}
          placeholder="Todos los estados"
          disabled={isLoading}
        />

        {/* Botones */}
        <div className="flex items-end gap-2">
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

      {/* Segunda fila: Rangos de fecha */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Date Range: Fecha del Evento */}
        <DateRangeField
          label="Fecha del Evento"
          nameFrom="eventDateFrom"
          nameTo="eventDateTo"
          valueFrom={eventDateFrom}
          valueTo={eventDateTo}
          onChangeFrom={(e) => setEventDateFrom(e.target.value)}
          onChangeTo={(e) => setEventDateTo(e.target.value)}
          disabled={isLoading}
        />

        {/* Date Range: Fecha de Creación */}
        <DateRangeField
          label="Fecha de Creación"
          nameFrom="creationDateFrom"
          nameTo="creationDateTo"
          valueFrom={creationDateFrom}
          valueTo={creationDateTo}
          onChangeFrom={(e) => setCreationDateFrom(e.target.value)}
          onChangeTo={(e) => setCreationDateTo(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Indicador de filtros activos */}
      <AppliedFilters appliedFilters={appliedFilters} />
    </div>
  );
};
