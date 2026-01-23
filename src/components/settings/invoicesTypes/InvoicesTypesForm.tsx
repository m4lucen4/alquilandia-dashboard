import { type FC, useState } from "react";
import InputField from "@/components/shared/InputField";
import type { InvoicesType, InvoicesTypeFormData } from "@/types/invoicesTypes";
import { validateInvoicesTypeForm } from "@/helpers/form";

interface InvoicesTypesFormProps {
  invoicesType?: InvoicesType | null;
  onSubmit: (data: InvoicesTypeFormData) => void;
  isLoading?: boolean;
}

export const InvoicesTypesForm: FC<InvoicesTypesFormProps> = ({
  invoicesType,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<InvoicesTypeFormData>(() => ({
    invoices: invoicesType?.invoices ?? "",
    percentage: invoicesType?.percentage ?? 0,
  }));

  const [errors, setErrors] = useState<
    Partial<Record<keyof InvoicesTypeFormData, string>>
  >({});

  const validateForm = (): boolean => {
    const newErrors = validateInvoicesTypeForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Convert to number for percentage field
    const processedValue = name === 'percentage' ? parseFloat(value) || 0 : value;

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Clear error when user starts typing
    if (errors[name as keyof InvoicesTypeFormData]) {
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
        label="Nombre del tipo de factura"
        name="invoices"
        value={formData.invoices}
        onChange={handleChange}
        error={errors.invoices}
        placeholder="Ej: Factura Estándar"
        required
        disabled={isLoading}
      />

      <InputField
        label="Porcentaje (%)"
        name="percentage"
        type="number"
        value={formData.percentage}
        onChange={handleChange}
        error={errors.percentage}
        placeholder="Ej: 15"
        required
        disabled={isLoading}
      />

      {/* Hidden submit button - form will be submitted by modal's accept button */}
      <button type="submit" className="hidden" />
    </form>
  );
};
