import React, { type FC, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { XMarkIcon } from "@heroicons/react/24/outline";
import InputField from "@/components/shared/InputField";
import SelectField from "@/components/shared/SelectField";
import Button from "@/components/shared/Button";
import type { Inventory } from "@/types/inventory";
import type { InventoryCategoryOption } from "@/types/inventoryCategories";

const editInventorySchema = z.object({
  elemento: z.string().min(1, "Obligatorio"),
  categoria: z.string().min(1, "Selecciona una categoría"),
  unidades: z.number().min(0, "Debe ser ≥ 0"),
  precioUd: z.number().min(0, "Debe ser ≥ 0"),
  precioCoste: z.number().min(0, "Debe ser ≥ 0"),
  costeTotal: z.number().min(0, "Debe ser ≥ 0"),
  private: z.boolean(),
  observaciones: z.string().optional(),
  images: z.array(z.instanceof(File)).optional(),
});

export type EditInventoryFormValues = z.infer<typeof editInventorySchema>;

interface ModalEditInventoryProps {
  isOpen: boolean;
  isEditing: boolean;
  item: Inventory | null;
  categoryOptions: InventoryCategoryOption[];
  onClose: () => void;
  onSubmit: (data: EditInventoryFormValues) => void;
}

export const ModalEditInventory: FC<ModalEditInventoryProps> = ({
  isOpen,
  isEditing,
  item,
  categoryOptions,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditInventoryFormValues>({
    resolver: zodResolver(editInventorySchema),
    defaultValues: {
      elemento: "",
      categoria: "",
      unidades: 0,
      precioUd: 0,
      precioCoste: 0,
      costeTotal: 0,
      private: false,
      observaciones: "",
      images: [],
    },
  });

  useEffect(() => {
    if (item && isOpen) {
      reset({
        elemento: item.elemento,
        categoria: item.categoria,
        unidades: item.unidades,
        precioUd: item.precioUd,
        precioCoste: item.precioCoste,
        costeTotal: item.costeTotal,
        private: item.private,
        observaciones: item.observaciones ?? "",
        images: [],
      });
    }
    if (!isOpen) reset();
  }, [isOpen, item, reset]);

  if (!isOpen) return null;

  const categorySelectOptions = categoryOptions.map((c) => ({
    value: c.id,
    label: `${c.principal} · ${c.nombre}`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-labelledby="modal-edit-inventory-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Cerrar modal"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="p-6 sm:p-8">
            <h3
              id="modal-edit-inventory-title"
              className="mb-6 text-xl font-semibold text-gray-900"
            >
              Editar artículo
            </h3>

            <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
              <Controller
                name="elemento"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="Nombre del artículo"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    required
                    error={errors.elemento?.message}
                  />
                )}
              />

              <Controller
                name="categoria"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Categoría"
                    name={field.name}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    options={categorySelectOptions}
                    placeholder="Selecciona una categoría"
                    required
                    error={errors.categoria?.message}
                  />
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="unidades"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      label="Unidades"
                      name={field.name}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(
                          Number.parseFloat(
                            (e as React.ChangeEvent<HTMLInputElement>).target
                              .value,
                          ) || 0,
                        )
                      }
                      onBlur={field.onBlur}
                      type="number"
                      error={errors.unidades?.message}
                    />
                  )}
                />

                <Controller
                  name="precioUd"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      label="Precio ud. (€)"
                      name={field.name}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(
                          Number.parseFloat(
                            (e as React.ChangeEvent<HTMLInputElement>).target
                              .value,
                          ) || 0,
                        )
                      }
                      onBlur={field.onBlur}
                      type="number"
                      error={errors.precioUd?.message}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="precioCoste"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      label="Precio coste (€)"
                      name={field.name}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(
                          Number.parseFloat(
                            (e as React.ChangeEvent<HTMLInputElement>).target
                              .value,
                          ) || 0,
                        )
                      }
                      onBlur={field.onBlur}
                      type="number"
                      error={errors.precioCoste?.message}
                    />
                  )}
                />

                <Controller
                  name="costeTotal"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      label="Coste total (€)"
                      name={field.name}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(
                          Number.parseFloat(
                            (e as React.ChangeEvent<HTMLInputElement>).target
                              .value,
                          ) || 0,
                        )
                      }
                      onBlur={field.onBlur}
                      type="number"
                      error={errors.costeTotal?.message}
                    />
                  )}
                />
              </div>

              <Controller
                name="observaciones"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="Observaciones"
                    name={field.name}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    as="textarea"
                    rows={3}
                    error={errors.observaciones?.message}
                  />
                )}
              />

              <Controller
                name="private"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <input
                      id="input-private-edit"
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="input-private-edit"
                      className="text-sm font-medium text-gray-900"
                    >
                      Artículo privado
                    </label>
                  </div>
                )}
              />

              <Controller
                name="images"
                control={control}
                render={({ field: { onChange } }) => (
                  <div>
                    <label className="block text-sm/6 font-medium text-gray-900">
                      Añadir imágenes
                    </label>
                    <p className="mb-2 text-xs text-gray-400">
                      Solo se subirán las imágenes nuevas que selecciones
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        onChange(e.target.files ? Array.from(e.target.files) : [])
                      }
                      className="block w-full text-sm text-gray-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-100"
                    />
                  </div>
                )}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 sm:px-8">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                title="Cancelar"
                onClick={onClose}
                variant="secondary"
                type="button"
              />
              <Button
                title="Guardar cambios"
                onClick={() => {}}
                variant="primary"
                type="submit"
                loading={isEditing}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
