import type { FC } from "react";
import InputField from "@/components/shared/InputField";
import Button from "@/components/shared/Button";
import type { ProfileFormData } from "@/types/profile";

interface ProfileFormProps {
  profileData: ProfileFormData;
  errors: Partial<Record<keyof ProfileFormData, string>>;
  isLoading: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onCompanyChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProfileForm: FC<ProfileFormProps> = ({
  profileData,
  errors,
  isLoading,
  onChange,
  onCompanyChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Datos personales
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Información básica de tu cuenta.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="Nombre"
            name="firstName"
            value={profileData.firstName}
            onChange={onChange}
            error={errors.firstName}
            disabled={isLoading}
            required
          />
          <InputField
            label="Apellidos"
            name="lastName"
            value={profileData.lastName}
            onChange={onChange}
            error={errors.lastName}
            disabled={isLoading}
            required
          />
        </div>

        <InputField
          label="Correo electrónico"
          name="email"
          type="email"
          value={profileData.email}
          onChange={onChange}
          error={errors.email}
          disabled={isLoading}
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="Teléfono"
            name="phone"
            type="tel"
            value={profileData.phone}
            onChange={onChange}
            error={errors.phone}
            disabled={isLoading}
          />
          <InputField
            label="Teléfono secundario"
            name="phone2"
            type="tel"
            value={profileData.phone2}
            onChange={onChange}
            error={errors.phone2}
            disabled={isLoading}
          />
        </div>

        <InputField
          label="Dirección"
          name="address"
          value={profileData.address}
          onChange={onChange}
          error={errors.address}
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InputField
            label="Localidad"
            name="locality"
            value={profileData.locality}
            onChange={onChange}
            error={errors.locality}
            disabled={isLoading}
          />
          <InputField
            label="Población"
            name="population"
            value={profileData.population}
            onChange={onChange}
            error={errors.population}
            disabled={isLoading}
          />
          <InputField
            label="Código postal"
            name="zipCode"
            value={profileData.zipCode}
            onChange={onChange}
            error={errors.zipCode}
            disabled={isLoading}
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Datos de facturación
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Opcional. Completa estos datos si necesitas facturación.
            </p>
          </div>

          <div className="mt-4 space-y-4">
            <InputField
              label="CIF/NIF"
              name="dnif"
              value={profileData.dnif}
              onChange={onChange}
              error={errors.dnif}
              disabled={isLoading}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="Nombre empresa"
                name="name"
                value={profileData.company.name}
                onChange={onCompanyChange}
                disabled={isLoading}
              />
              <InputField
                label="NIF empresa"
                name="nif"
                value={profileData.company.nif}
                onChange={onCompanyChange}
                disabled={isLoading}
              />
            </div>
            <InputField
              label="Dirección empresa"
              name="address"
              value={profileData.company.address}
              onChange={onCompanyChange}
              disabled={isLoading}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <InputField
                label="Localidad empresa"
                name="locality"
                value={profileData.company.locality}
                onChange={onCompanyChange}
                disabled={isLoading}
              />
              <InputField
                label="Población empresa"
                name="population"
                value={profileData.company.population}
                onChange={onCompanyChange}
                disabled={isLoading}
              />
              <InputField
                label="Código postal empresa"
                name="zipCode"
                value={profileData.company.zipCode}
                onChange={onCompanyChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            title={isLoading ? "Guardando..." : "Guardar cambios"}
            onClick={() => {}}
            type="submit"
            loading={isLoading}
            disabled={isLoading}
          />
        </div>
      </div>
    </form>
  );
};
