import { type FC } from "react";
import Button from "@/components/shared/Button";
import InputField from "@/components/shared/InputField";
import SelectField from "@/components/shared/SelectField";
import { AppliedFiltersUsers } from "./AppliedFiltersUsers";
import type { UsersAppliedFilters } from "@/hooks/useUserSearch";
import { ROLE_OPTIONS } from "@/constants";

interface SearchUsersProps {
  email: string;
  setEmail: (value: string) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  dnif: string;
  setDnif: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  appliedFilters: UsersAppliedFilters;
  isLoading?: boolean;
  onSearch: () => void;
  onClearFilters: () => void;
}

export const SearchUsers: FC<SearchUsersProps> = ({
  email,
  setEmail,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  dnif,
  setDnif,
  phone,
  setPhone,
  role,
  setRole,
  appliedFilters,
  isLoading = false,
  onSearch,
  onClearFilters,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="mt-6 rounded-lg bg-white p-4 shadow ring-1 ring-black/5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InputField
          label="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="usuario@email.com"
          disabled={isLoading}
        />

        <InputField
          label="Nombre"
          name="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nombre"
          disabled={isLoading}
        />

        <InputField
          label="Apellidos"
          name="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Apellidos"
          disabled={isLoading}
        />

        <InputField
          label="DNI"
          name="dnif"
          value={dnif}
          onChange={(e) => setDnif(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="12345678A"
          disabled={isLoading}
        />

        <InputField
          label="Teléfono"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="600000000"
          disabled={isLoading}
        />

        <SelectField
          label="Tipo de usuario"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={ROLE_OPTIONS}
          placeholder="Todos"
          disabled={isLoading}
        />

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

      <AppliedFiltersUsers appliedFilters={appliedFilters} />
    </div>
  );
};
