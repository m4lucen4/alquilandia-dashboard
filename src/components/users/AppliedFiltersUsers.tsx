import { type FC } from "react";
import type { UsersAppliedFilters } from "@/hooks/useUserSearch";

interface AppliedFiltersUsersProps {
  appliedFilters: UsersAppliedFilters;
}

export const AppliedFiltersUsers: FC<AppliedFiltersUsersProps> = ({
  appliedFilters,
}) => {
  const hasActiveFilters =
    appliedFilters.email ||
    appliedFilters.firstName ||
    appliedFilters.lastName ||
    appliedFilters.dnif ||
    appliedFilters.phone;

  if (!hasActiveFilters) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-600">Filtros activos:</span>
      {appliedFilters.email && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Email: {appliedFilters.email}
        </span>
      )}
      {appliedFilters.firstName && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Nombre: {appliedFilters.firstName}
        </span>
      )}
      {appliedFilters.lastName && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Apellidos: {appliedFilters.lastName}
        </span>
      )}
      {appliedFilters.dnif && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          DNI: {appliedFilters.dnif}
        </span>
      )}
      {appliedFilters.phone && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Teléfono: {appliedFilters.phone}
        </span>
      )}
    </div>
  );
};
