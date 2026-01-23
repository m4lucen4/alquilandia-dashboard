import { type FC, useState } from "react";
import InputField from "@/components/shared/InputField";
import type { TaxesType, TaxesTypeFormData } from "@/types/taxesTypes";
import { validateTaxesTypeForm } from "@/helpers/form";

interface TaxesTypesFormProps {
  taxesType?: TaxesType | null;
  onSubmit: (data: TaxesTypeFormData) => void;
  isLoading?: boolean;
}

export const TaxesTypesForm: FC<TaxesTypesFormProps> = ({
  taxesType,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<TaxesTypeFormData>(() => ({
    name: taxesType?.name ?? "",
    tax: taxesType?.tax ?? 0,
  }));

  const [errors, setErrors] = useState<
    Partial<Record<keyof TaxesTypeFormData, string>>
  >({});

  const validateForm = (): boolean => {
    const newErrors = validateTaxesTypeForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Convert to number for tax field
    const processedValue = name === 'tax' ? parseFloat(value) || 0 : value;

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Clear error when user starts typing
    if (errors[name as keyof TaxesTypeFormData]) {
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
        label="Nombre del tipo de impuesto"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Ej: IVA General"
        required
        disabled={isLoading}
      />

      <InputField
        label="Porcentaje (%)"
        name="tax"
        type="number"
        value={formData.tax}
        onChange={handleChange}
        error={errors.tax}
        placeholder="Ej: 21"
        required
        disabled={isLoading}
      />

      {/* Hidden submit button - form will be submitted by modal's accept button */}
      <button type="submit" className="hidden" />
    </form>
  );
};
