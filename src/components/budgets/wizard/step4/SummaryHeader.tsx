import { type FC } from "react";
import type { Budget } from "@/types/budgets";

interface SummaryHeaderProps {
  budget: Budget;
}

function formatEventDate(iso: string): string {
  if (!iso || iso.startsWith("0001-")) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export const SummaryHeader: FC<SummaryHeaderProps> = ({ budget }) => {
  const { user, address, nosend, eventDate, distance } = budget;
  const clientName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Datos del presupuesto</h2>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-xs font-medium text-gray-500">Cliente</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{clientName || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500">Email</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{user.email || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500">Teléfono</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{user.phone || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500">Fecha del evento</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{formatEventDate(eventDate)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-gray-500">Dirección de entrega</dt>
          <dd className="mt-0.5 text-sm text-gray-900">
            {nosend
              ? "Cliente recoge y entrega los artículos en tienda."
              : address || "—"}
          </dd>
        </div>
        {!nosend && distance && (
          <div>
            <dt className="text-xs font-medium text-gray-500">Distancia al almacén</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{distance}</dd>
          </div>
        )}
      </dl>
    </div>
  );
};
