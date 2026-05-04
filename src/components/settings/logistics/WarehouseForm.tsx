import { type FC } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "@/components/shared/InputField";
import { PlacesAutocompleteField } from "@/components/shared/PlacesAutocompleteField";
import type { Warehouse } from "@/types/warehouses";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  address: z.string().min(1, "La dirección es obligatoria"),
  use_for_mileage: z.boolean(),
  latitude: z
    .number()
    .refine((v) => v !== 0, "Selecciona una dirección válida del desplegable"),
  longitude: z
    .number()
    .refine((v) => v !== 0, "Selecciona una dirección válida del desplegable"),
});

export type WarehouseFormValues = z.infer<typeof schema>;

interface WarehouseFormProps {
  warehouse?: Warehouse | null;
  onSubmit: (data: WarehouseFormValues) => void;
  isLoading?: boolean;
}

export const WarehouseForm: FC<WarehouseFormProps> = ({
  warehouse,
  onSubmit,
  isLoading = false,
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: warehouse?.name ?? "",
      address: warehouse?.address ?? "",
      use_for_mileage: warehouse?.use_for_mileage ?? false,
      latitude: warehouse?.latitude ?? 0,
      longitude: warehouse?.longitude ?? 0,
    },
  });

  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });
  const hasCoordinates = latitude !== 0 || longitude !== 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <InputField
            label="Nombre del almacén"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder="Ej: Almacén Central"
            required
            error={errors.name?.message}
            disabled={isLoading}
          />
        )}
      />

      <Controller
        name="address"
        control={control}
        render={({ field }) => (
          <PlacesAutocompleteField
            label="Dirección"
            name={field.name}
            value={field.value}
            onChange={(val) => field.onChange(val)}
            onLocationChange={(loc) => {
              setValue("latitude", Number.parseFloat(loc.latitude), { shouldValidate: true });
              setValue("longitude", Number.parseFloat(loc.longitude), { shouldValidate: true });
            }}
            onBlur={field.onBlur}
            required
            placeholder="Escribe la dirección del almacén..."
            error={errors.address?.message ?? errors.latitude?.message ?? errors.longitude?.message}
            disabled={isLoading}
          />
        )}
      />

      {hasCoordinates && (
        <p className="text-xs text-gray-400">
          📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}

      <Controller
        name="use_for_mileage"
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <input
              id="use_for_mileage"
              type="checkbox"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="use_for_mileage"
              className="text-sm font-medium text-gray-700"
            >
              Usar para cálculo de kilometraje
            </label>
          </div>
        )}
      />

      <button type="submit" className="hidden" />
    </form>
  );
};
