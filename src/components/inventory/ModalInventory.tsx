import React, { type FC, useEffect, useMemo, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import InputField from "@/components/shared/InputField";
import SelectField from "@/components/shared/SelectField";
import Button from "@/components/shared/Button";
import { PricesTab } from "./PricesTab";
import { s3BaseURL } from "@/constants";
import type { Inventory } from "@/types/inventory";
import type { InventoryCategoryOption } from "@/types/inventoryCategories";

const inventorySchema = z.object({
  elemento: z.string().min(1, "Obligatorio"),
  categoria: z.string().min(1, "Selecciona una categoría"),
  unidades: z.number().min(0, "Debe ser ≥ 0"),
  precioUd: z.number().min(0, "Debe ser ≥ 0"),
  precioCoste: z.number().min(0, "Debe ser ≥ 0"),
  costeTotal: z.number().min(0, "Debe ser ≥ 0"),
  private: z.boolean(),
  observaciones: z.string().optional(),
  images: z.array(z.instanceof(File)).optional(),
  deletedImageIds: z.array(z.string()),
  extras: z.array(
    z.object({
      extraName: z.string().min(1, "Obligatorio"),
      price: z.number().min(0, "Debe ser ≥ 0"),
    }),
  ),
  priceExceptionList: z.array(
    z.object({
      date: z.string(),
      price: z.number().min(0, "Debe ser ≥ 0"),
    }),
  ),
});

export type InventoryFormValues = z.infer<typeof inventorySchema>;

type Tab = "info" | "extras" | "precios";

const TABS: { id: Tab; label: string }[] = [
  { id: "info", label: "Información" },
  { id: "extras", label: "Extras" },
  { id: "precios", label: "Precios especiales" },
];

interface ModalInventoryProps {
  isOpen: boolean;
  isSaving: boolean;
  item: Inventory | null;
  categoryOptions: InventoryCategoryOption[];
  onClose: () => void;
  onSubmit: (data: InventoryFormValues) => void;
}

export const ModalInventory: FC<ModalInventoryProps> = ({
  isOpen,
  isSaving,
  item,
  categoryOptions,
  onClose,
  onSubmit,
}) => {
  const isEditing = item !== null;

  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [selectedPrincipal, setSelectedPrincipal] = useState("");
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState<number | "">(0);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
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
      deletedImageIds: [],
      extras: [],
      priceExceptionList: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "extras" });

  useEffect(() => {
    if (isOpen) {
      reset({
        elemento: item?.elemento ?? "",
        categoria: item?.categoria ?? "",
        unidades: item?.unidades ?? 0,
        precioUd: item?.precioUd ?? 0,
        precioCoste: item?.precioCoste ?? 0,
        costeTotal: item?.costeTotal ?? 0,
        private: item?.private ?? false,
        observaciones: item?.observaciones ?? "",
        images: [],
        deletedImageIds: [],
        extras: (item?.extras ?? []).map((e) => ({
          extraName: e.extraName,
          price: e.price,
        })),
        priceExceptionList: (item?.priceExceptionList ?? []).map((e) => ({
          date: e.date.substring(0, 10),
          price: e.price,
        })),
      });
      setSelectedPrincipal(item?.categoriaObj?.principal ?? "");
      setActiveTab("info");
      setNewExtraName("");
      setNewExtraPrice(0);
    } else {
      reset();
      setSelectedPrincipal("");
    }
  }, [isOpen, item, reset]);

  const watchedUnidades = watch("unidades");
  const watchedPrecioCoste = watch("precioCoste");

  useEffect(() => {
    setValue("costeTotal", (watchedUnidades ?? 0) * (watchedPrecioCoste ?? 0), {
      shouldValidate: false,
    });
  }, [watchedUnidades, watchedPrecioCoste, setValue]);

  const principalOptions = useMemo(() => {
    const seen = new Set<string>();
    return categoryOptions
      .filter((c) => {
        if (seen.has(c.principal)) return false;
        seen.add(c.principal);
        return true;
      })
      .map((c) => ({ value: c.principal, label: c.principal }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categoryOptions]);

  const subcategoriaOptions = useMemo(() => {
    if (!selectedPrincipal) return [];
    return categoryOptions
      .filter((c) => c.principal === selectedPrincipal)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .map((c) => ({ value: c.id, label: c.nombre }));
  }, [categoryOptions, selectedPrincipal]);

  if (!isOpen) return null;

  const handleAddExtra = () => {
    if (!newExtraName.trim()) return;
    append({
      extraName: newExtraName.trim(),
      price: typeof newExtraPrice === "number" ? newExtraPrice : 0,
    });
    setNewExtraName("");
    setNewExtraPrice(0);
  };

  const toNumber = (e: React.ChangeEvent<HTMLInputElement>) =>
    Number.parseFloat(e.target.value) || 0;

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
        aria-labelledby="modal-inventory-title"
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
          <div className="px-6 pt-6 sm:px-8 sm:pt-8">
            <h3
              id="modal-inventory-title"
              className="mb-5 text-xl font-semibold text-gray-900"
            >
              {isEditing ? "Editar artículo" : "Nuevo artículo"}
            </h3>

            <div className="flex border-b border-gray-200">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none",
                    activeTab === tab.id
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[55vh] overflow-y-auto px-6 py-5 sm:px-8">
            {activeTab === "info" && (
              <div className="space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Categoría principal"
                    name="principal"
                    value={selectedPrincipal}
                    onChange={(e) => {
                      setSelectedPrincipal(e.target.value);
                      setValue("categoria", "", { shouldValidate: false });
                    }}
                    options={principalOptions}
                    placeholder="Selecciona principal"
                    required
                  />

                  <Controller
                    name="categoria"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        label="Subcategoría"
                        name={field.name}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        options={subcategoriaOptions}
                        placeholder="Selecciona subcategoría"
                        disabled={!selectedPrincipal}
                        required
                        error={errors.categoria?.message}
                      />
                    )}
                  />
                </div>

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
                            toNumber(e as React.ChangeEvent<HTMLInputElement>),
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
                            toNumber(e as React.ChangeEvent<HTMLInputElement>),
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
                            toNumber(e as React.ChangeEvent<HTMLInputElement>),
                          )
                        }
                        onBlur={field.onBlur}
                        type="number"
                        error={errors.precioCoste?.message}
                      />
                    )}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      Coste total (€)
                    </label>
                    <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      {(watchedUnidades ?? 0) * (watchedPrecioCoste ?? 0)} €
                    </div>
                  </div>
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
                        id="input-private"
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="input-private"
                        className="text-sm font-medium text-gray-900"
                      >
                        Artículo privado
                      </label>
                    </div>
                  )}
                />

                <div>
                  <label className="block text-sm/6 font-medium text-gray-900">
                    Imágenes
                  </label>

                  {isEditing && (
                    <Controller
                      name="deletedImageIds"
                      control={control}
                      render={({
                        field: { value: deletedIds, onChange: setDeletedIds },
                      }) => {
                        const visibleImages = (item.archivo ?? []).filter(
                          (img) => !deletedIds.includes(img.id),
                        );
                        return visibleImages.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {visibleImages.map((img) => (
                              <div
                                key={img.id}
                                className="relative h-20 w-20 shrink-0"
                              >
                                <img
                                  src={`${s3BaseURL}${img.fileUri}`}
                                  alt={img.fileName}
                                  className="h-full w-full rounded-lg border border-gray-200 object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23f3f4f6'/%3E%3C/svg%3E";
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeletedIds([...deletedIds, img.id])
                                  }
                                  className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                  aria-label={`Eliminar imagen ${img.fileName}`}
                                >
                                  <XMarkIcon className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-gray-400">
                            Sin imágenes existentes
                          </p>
                        );
                      }}
                    />
                  )}

                  <Controller
                    name="images"
                    control={control}
                    render={({ field: { onChange } }) => (
                      <div className="mt-3">
                        <p className="mb-1.5 text-xs text-gray-400">
                          Selecciona archivos para subir imágenes nuevas
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) =>
                            onChange(
                              e.target.files
                                ? Array.from(e.target.files)
                                : [],
                            )
                          }
                          className="block w-full text-sm text-gray-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-100"
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            {activeTab === "extras" && (
              <div className="space-y-5">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-sm/6 font-medium text-gray-900">
                      Nombre del extra
                    </label>
                    <input
                      type="text"
                      value={newExtraName}
                      onChange={(e) => setNewExtraName(e.target.value)}
                      placeholder="Ej: Hora extra"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm/6 font-medium text-gray-900">
                      Precio (€)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newExtraPrice}
                      onChange={(e) =>
                        setNewExtraPrice(
                          e.target.value === ""
                            ? ""
                            : Number.parseFloat(e.target.value) || 0,
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExtra}
                    className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Añadir
                  </button>
                </div>

                {fields.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-400">
                    No hay extras añadidos
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                    {fields.map((field, index) => (
                      <li
                        key={field.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {field.extraName}
                          </p>
                          <p className="text-xs text-gray-500">{field.price} €</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none"
                          aria-label={`Eliminar extra ${field.extraName}`}
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "precios" && <PricesTab control={control} />}
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
                title={isEditing ? "Guardar cambios" : "Crear artículo"}
                onClick={() => {}}
                variant="primary"
                type="submit"
                loading={isSaving}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
