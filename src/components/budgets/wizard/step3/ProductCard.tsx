import { type FC, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import type { Inventory } from "@/types/inventory";
import type { Discount } from "@/types/discounts";
import type { Extra } from "@/types/budgets";
import { getExceptionPrice } from "@/helpers/budgetLines";
import { formatCurrency } from "@/helpers";
import { s3BaseURL } from "@/constants";
import Button from "@/components/shared/Button";
import { ExtrasModal } from "./ExtrasModal";

export interface ProductCardFormValues {
  units: number;
  descuento: number;
  extras: Extra[];
}

interface ProductCardProps {
  product: Inventory;
  availableUnits: number;
  eventDate: string;
  discounts: Discount[];
  showDiscount: boolean;
  isSaving: boolean;
  onAdd: (product: Inventory, values: ProductCardFormValues) => void;
}

const placeholderImg = "https://placehold.co/300x200?text=Sin+imagen";

const cardClasses = "flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden";
const availableTextBase = "text-sm font-medium";

export const ProductCard: FC<ProductCardProps> = ({
  product,
  availableUnits,
  eventDate,
  discounts,
  showDiscount,
  isSaving,
  onAdd,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  const defaultExtras: Extra[] = (product.extras ?? []).map((ie) => ({
    id: ie.id ?? "",
    extraName: ie.extraName,
    price: ie.price,
    checked: ie.checked ?? false,
    units: ie.units ?? 1,
  }));

  const { register, control, handleSubmit, watch, setValue } =
    useForm<ProductCardFormValues>({
      defaultValues: {
        units: 1,
        descuento: 0,
        extras: defaultExtras,
      },
    });

  const { fields } = useFieldArray({ control, name: "extras" });
  const currentUnits = watch("units");
  const currentExtras = watch("extras");
  const checkedExtrasCount = currentExtras.filter((e) => e.checked).length;

  const unitPrice = getExceptionPrice(product, eventDate);
  const isUnavailable = availableUnits <= 0;

  const handleDecrement = () => {
    if (currentUnits > 1) setValue("units", currentUnits - 1);
  };

  const handleIncrement = () => {
    if (currentUnits < availableUnits) setValue("units", currentUnits + 1);
  };

  const handleUnitsChange = (value: number) => {
    const clamped = Math.min(Math.max(1, value), availableUnits);
    setValue("units", clamped);
  };

  const imageUrl =
    product.archivo?.[0]?.fileUri ? `${s3BaseURL}${product.archivo[0].fileUri}` : placeholderImg;

  return (
    <div className={cardClasses}>
      {/* Imagen */}
      <div className="relative h-40 w-full bg-gray-100">
        <img
          src={imageUrl}
          alt={product.elemento}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = placeholderImg;
          }}
        />
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Nombre y precio */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">{product.elemento}</h3>
          <span className="shrink-0 text-base font-bold text-blue-600">
            {formatCurrency(unitPrice)}
          </span>
        </div>

        {/* Costo de rotura */}
        {product.precioCoste > 0 && (
          <p className="text-xs text-gray-400">Costo de rotura: {formatCurrency(product.precioCoste)}</p>
        )}

        {/* Disponibilidad */}
        <p className={`${availableTextBase} ${isUnavailable ? "text-red-600" : "text-gray-600"}`}>
          {isUnavailable ? "Sin disponibilidad" : `Uds. disponibles: ${availableUnits}`}
        </p>

        {/* Botones info y extras */}
        <div className="flex gap-2 flex-wrap">
          {product.observaciones && (
            <button
              type="button"
              onClick={() => setShowInfo((v) => !v)}
              className="text-xs text-blue-600 underline hover:text-blue-800"
            >
              {showInfo ? "Ocultar info" : "+ Info"}
            </button>
          )}
          {fields.length > 0 && (
            <button
              type="button"
              onClick={() => setShowExtras(true)}
              className="flex items-center gap-1 text-xs text-blue-600 underline hover:text-blue-800"
            >
              Extras
              {checkedExtrasCount > 0 && (
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                  {checkedExtrasCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Info desplegable */}
        {showInfo && product.observaciones && (
          <p className="rounded-md bg-gray-50 p-2 text-xs text-gray-600">{product.observaciones}</p>
        )}

        {/* Select de descuento (solo ADMIN/TECHNICIAN) */}
        {showDiscount && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Descuento</label>
            <Controller
              name="descuento"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={0}>Sin descuento</option>
                  {discounts.map((d) => (
                    <option key={d.id} value={d.porcentaje}>
                      {d.concepto} ({d.porcentaje}%)
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        )}

        {/* Selector de cantidad */}
        <div className="flex items-center gap-2 mt-auto">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isUnavailable || currentUnits <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={availableUnits}
            disabled={isUnavailable}
            className="w-14 rounded-md border border-gray-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            value={currentUnits}
            onChange={(e) => handleUnitsChange(Number(e.target.value))}
          />
          <button
            type="button"
            onClick={handleIncrement}
            disabled={isUnavailable || currentUnits >= availableUnits}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            +
          </button>
        </div>

        {/* Botón añadir */}
        <Button
          title="Añadir"
          onClick={handleSubmit((values) => onAdd(product, values))}
          variant="primary"
          size="sm"
          block
          disabled={isUnavailable || isSaving}
          loading={isSaving}
          type="button"
        />
      </div>

      {/* Modal de extras */}
      {showExtras && (
        <ExtrasModal
          control={control}
          register={register}
          onClose={() => setShowExtras(false)}
        />
      )}
    </div>
  );
};
