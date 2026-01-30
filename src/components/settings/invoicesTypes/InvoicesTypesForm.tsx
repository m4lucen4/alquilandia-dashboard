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
    concept: invoicesType?.concept ?? "",
    show_budgetlines: invoicesType?.show_budgetlines ?? true,
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
    const { name, value, type, checked } = e.target;

    // Process value based on field type
    let processedValue: string | number | boolean = value;
    if (type === 'checkbox') {
      processedValue = checked;
    } else if (name === 'percentage') {
      processedValue = parseFloat(value) || 0;
    }

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

      <InputField
        label="Concepto"
        name="concept"
        value={formData.concept || ""}
        onChange={handleChange}
        error={errors.concept}
        placeholder="Texto que aparecerá en el PDF de la factura"
        disabled={isLoading}
      />

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="show_budgetlines"
          name="show_budgetlines"
          checked={formData.show_budgetlines || false}
          onChange={handleChange}
          disabled={isLoading}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <label
          htmlFor="show_budgetlines"
          className="text-sm font-medium text-gray-700"
        >
          Mostrar líneas de presupuesto en el PDF
        </label>
      </div>

      {/* Hidden submit button - form will be submitted by modal's accept button */}
      <button type="submit" className="hidden" />
    </form>
  );
};
