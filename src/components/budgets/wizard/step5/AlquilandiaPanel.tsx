import { type FC } from "react";
import Button from "@/components/shared/Button";

interface AlquilandiaPanelProps {
  isLoading: boolean;
  onReserve: () => void;
  onPaid25: () => void;
}

export const AlquilandiaPanel: FC<AlquilandiaPanelProps> = ({ isLoading, onReserve, onPaid25 }) => {
  return (
    <div className="rounded-xl border border-purple-100 bg-purple-50 p-5 flex flex-col gap-4">
      <p className="text-sm text-gray-700">
        Alquilandia confirma la reserva sin necesidad de pago previo por parte del cliente.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          title="Dejar reservado"
          onClick={onReserve}
          variant="secondary"
          type="button"
          disabled={isLoading}
        />
        <Button
          title="Marcar como pagado 25%"
          onClick={onPaid25}
          variant="primary"
          type="button"
          disabled={isLoading}
        />
      </div>
    </div>
  );
};
