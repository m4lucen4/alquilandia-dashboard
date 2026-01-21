import { type FC, useState } from "react";
import InputField from "@/components/shared/InputField";
import type { Business, BusinessFormData } from "@/types/business";

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
  }));

  const [errors, setErrors] = useState<
    Partial<Record<keyof BusinessFormData, string>>
  >({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BusinessFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!formData.nif.trim()) {
      newErrors.nif = "El NIF es obligatorio";
    } else if (!/^[A-Z0-9]{9}$/i.test(formData.nif.trim())) {
      newErrors.nif = "El NIF debe tener 9 caracteres alfanuméricos";
    }

    if (!formData.address.trim()) {
      newErrors.address = "La dirección es obligatoria";
    }

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
        placeholder="Ej: Calle Principal 123, Madrid"
        required
        disabled={isLoading}
      />

      {/* Hidden submit button - form will be submitted by modal's accept button */}
      <button type="submit" className="hidden" />
    </form>
  );
};
