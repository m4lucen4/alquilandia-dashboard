import { type FC } from "react";
import Button from "../shared/Button";
import InputField from "../shared/InputField";
import SelectField from "../shared/SelectField";
import DateRangeField from "../shared/DateRangeField";
import { getStatusBadgeConfig } from "@/helpers";

interface SearchBudgetsProps {
  budgetNumber: string;
  setBudgetNumber: (value: string) => void;
  clientName: string;
  setClientName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  eventDateFrom: string;
  setEventDateFrom: (value: string) => void;
  eventDateTo: string;
  setEventDateTo: (value: string) => void;
  creationDateFrom: string;
  setCreationDateFrom: (value: string) => void;
  creationDateTo: string;
  setCreationDateTo: (value: string) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  appliedFilters: {
    budgetNumber: string;
    clientName: string;
    phone: string;
    status: string;
    eventDateFrom: string;
    eventDateTo: string;
    creationDateFrom: string;
    creationDateTo: string;
  };
  isLoading?: boolean;
}

/**
 * Formats a date string (YYYY-MM-DD) to a readable format (DD/MM/YYYY)
 */
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

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

  const statusOptions = [
    { value: "PAID_PENDING", label: "Pendiente" },
    { value: "PAID25", label: "Pagado 25%" },
    { value: "PAID", label: "Pagado" },
    { value: "RESERVED", label: "Reservado" },
    { value: "REJECTED", label: "Rechazado" },
    { value: "CANCELLED", label: "Cancelado" },
  ];

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
      {(appliedFilters.budgetNumber ||
        appliedFilters.clientName ||
        appliedFilters.phone ||
        appliedFilters.status ||
        appliedFilters.eventDateFrom ||
        appliedFilters.eventDateTo ||
        appliedFilters.creationDateFrom ||
        appliedFilters.creationDateTo) && (
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
          {(appliedFilters.creationDateFrom ||
            appliedFilters.creationDateTo) && (
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
      )}
    </div>
  );
};
