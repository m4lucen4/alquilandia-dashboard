import { type FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "@/components/shared/InputField";
import type { InventoryCategory } from "@/types/inventoryCategories";

const schema = z.object({
  principal: z.string().min(1, "La categoría principal es obligatoria"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
});

export type InventoryCategoryFormValues = z.infer<typeof schema>;

interface InventoryCategoryFormProps {
  category?: InventoryCategory | null;
  onSubmit: (data: InventoryCategoryFormValues) => void;
  isLoading?: boolean;
}

export const InventoryCategoryForm: FC<InventoryCategoryFormProps> = ({
  category,
  onSubmit,
  isLoading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryCategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      principal: category?.principal ?? "",
      nombre: category?.nombre ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Controller
        name="principal"
        control={control}
        render={({ field }) => (
          <InputField
            label="Categoría principal"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder="Ej: ATRACCIONES"
            required
            error={errors.principal?.message}
            disabled={isLoading}
          />
        )}
      />

      <Controller
        name="nombre"
        control={control}
        render={({ field }) => (
          <InputField
            label="Nombre"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder="Ej: HINCHABLES-ACUÁTICOS-DESLIZADOR"
            required
            error={errors.nombre?.message}
            disabled={isLoading}
          />
        )}
      />

      <button type="submit" className="hidden" />
    </form>
  );
};
