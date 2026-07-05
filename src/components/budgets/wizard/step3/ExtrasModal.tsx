import { type FC } from "react";
import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import { Modal } from "@/components/shared/Modal";
import type { ProductCardFormValues } from "./ProductCard";

interface ExtrasModalProps {
  control: Control<ProductCardFormValues>;
  register: UseFormRegister<ProductCardFormValues>;
  onClose: () => void;
}

export const ExtrasModal: FC<ExtrasModalProps> = ({ control, register, onClose }) => {
  const { fields } = useFieldArray({ control, name: "extras" });

  return (
    <Modal
      title="Extras del producto"
      onAccept={onClose}
      onClose={onClose}
      cancelText=""
      acceptText="Cerrar"
    >
      {fields.length === 0 ? (
        <p className="text-sm text-gray-500">Este producto no tiene extras disponibles.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3 py-3">
              <input
                type="checkbox"
                id={`extra-${index}`}
                {...register(`extras.${index}.checked`)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`extra-${index}`} className="flex-1 cursor-pointer">
                <span className="block text-sm font-medium text-gray-900">{field.extraName}</span>
                <span className="text-xs text-gray-500">{field.price.toFixed(2)} € / ud.</span>
              </label>
              <input
                type="number"
                min={1}
                {...register(`extras.${index}.units`, { valueAsNumber: true, min: 1 })}
                className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
