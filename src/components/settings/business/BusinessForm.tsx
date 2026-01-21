import { type FC, useState } from "react";
import InputField from "@/components/shared/InputField";
import type { Business, BusinessFormData } from "@/types/business";
import { validateBusinessForm } from "@/helpers/form";

interface BusinessFormProps {
  business?: Business | null;
  onSubmit: (data: BusinessFormData) => void;
  isLoading?: boolean;
}

export const BusinessForm: FC<BusinessFormProps> = ({
  business,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<BusinessFormData>(() => ({
    name: business?.name ?? "",
    nif: business?.nif ?? "",
    address: business?.address ?? "",
    locality: business?.locality ?? "",
    province: business?.province ?? "",
    phone: business?.phone ?? "",
    postal_code: business?.postal_code ?? "",
  }));

  const [errors, setErrors] = useState<
    Partial<Record<keyof BusinessFormData, string>>
  >({});

  const validateForm = (): boolean => {
    const newErrors = validateBusinessForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name as keyof BusinessFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Nombre de la empresa"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Ej: Mi Empresa S.L."
        required
        disabled={isLoading}
      />

      <InputField
        label="NIF"
        name="nif"
        value={formData.nif}
        onChange={handleChange}
        error={errors.nif}
        placeholder="Ej: B12345678"
        required
        disabled={isLoading}
      />

      <InputField
        label="Dirección"
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        placeholder="Ej: Calle Principal 123"
        required
        disabled={isLoading}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Localidad"
          name="locality"
          value={formData.locality}
          onChange={handleChange}
          error={errors.locality}
          placeholder="Ej: Madrid"
          required
          disabled={isLoading}
        />

        <InputField
          label="Provincia"
          name="province"
          value={formData.province}
          onChange={handleChange}
          error={errors.province}
          placeholder="Ej: Madrid"
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Teléfono"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="Ej: 912345678"
          required
          disabled={isLoading}
        />

        <InputField
          label="Código Postal"
          name="postal_code"
          value={formData.postal_code}
          onChange={handleChange}
          error={errors.postal_code}
          placeholder="Ej: 28001"
          required
          disabled={isLoading}
        />
      </div>

      {/* Hidden submit button - form will be submitted by modal's accept button */}
      <button type="submit" className="hidden" />
    </form>
  );
};
