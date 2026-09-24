import { type FC, useMemo, useState } from "react";
import { Modal } from "../shared/Modal";
import { formatCurrency, getStatusBadgeConfig } from "@/helpers";
import { formatDate } from "@/helpers/dates";
import type {
  BudgetHistoryEntry,
  HistoricBudgetSnapshot,
  HistoricReceipt,
  User,
} from "@/types/budgets";

interface ModalBudgetHistoryProps {
  isOpen: boolean;
  historyId: number;
  onClose: () => void;
  entries: BudgetHistoryEntry[] | null;
  technicians: User[];
  isLoading?: boolean;
  error?: string | null;
}

const eventTypeLabels: Record<string, string> = {
  BUDGET_CREATED: "Creado",
  STATUS_CHANGE: "Cambio de estado",
  EVENT_ADDRESS_CHANGE: "Cambio de dirección",
  EVENT_DATE_CHANGE: "Cambio de fecha",
  BUDGETLINES_CHANGE: "Cambio de productos",
  TECHNICIAN_CHANGE: "Cambio de técnico",
  RECEIPT_25_CREATED: "Factura 25%",
  RECEIPT_100_CREATED: "Factura 100%",
  RECEIPT_FROM_25_TO_100: "Cambio de Factura 25% a 100%",
};

const formatDateTime = (date: string) => {
  if (!date || Number.isNaN(new Date(date).getTime())) return "-";

  return new Date(date).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getHistoricReceipts = (entry: BudgetHistoryEntry): HistoricReceipt[] =>
  entry.receipts ?? entry.budget?.receipts ?? entry.budget?.budgetReceipts ?? [];

const receiptLabel = (receipt: HistoricReceipt) => {
  if (receipt.type === "Factura100") return "Factura final";
  if (receipt.type === "Factura25") return "Factura reserva";
  return "Factura";
};

const formatHistoricAmount = (amount: number | undefined) =>
  typeof amount === "number" && Number.isFinite(amount) ? formatCurrency(amount) : "-";

const getEntryKey = (entry: BudgetHistoryEntry, index: number) =>
  entry.id ?? `${entry.historyDate}-${entry.eventType}-${index}`;

const getHistoricSummary = (budget: HistoricBudgetSnapshot) => {
  const price = budget.price;
  if (
    typeof price?.subTotal !== "number" ||
    typeof price.subTotalWithExtras !== "number" ||
    typeof price.userDiscount !== "number" ||
    typeof price.costSend !== "number"
  ) {
    return null;
  }

  const couponDiscount = budget.totalCouponDiscount ?? 0;
  const base = price.subTotalWithExtras - price.userDiscount - couponDiscount + price.costSend;
  const vat = base * 0.21;
  const total = price.withIVA ? base * 1.21 : base;
  const discountedSubtotal = price.subTotalWithExtras - Math.max(price.userDiscount, couponDiscount);

  return { couponDiscount, discountedSubtotal, vat, total };
};

const HistoricBudgetSnapshotDetails: FC<{
  entry: BudgetHistoryEntry;
  technicians: User[];
}> = ({ entry, technicians }) => {
  const budget = entry.budget;
  if (!budget) {
    return <p className="py-8 text-center text-gray-500">No hay una versión histórica disponible para esta acción.</p>;
  }

  const receipts = getHistoricReceipts(entry).filter(
    (receipt) => receipt.type === "Factura100" || receipt.type === "Factura25",
  );
  const clientName =
    budget.user?.FullName ||
    budget.user?.name ||
    `${budget.user?.firstName || ""} ${budget.user?.lastName || ""}`.trim() ||
    budget.client ||
    "-";
  const historicalTechnicianName =
    budget.technician?.FullName ||
    budget.technician?.name ||
    `${budget.technician?.firstName || ""} ${budget.technician?.lastName || ""}`.trim();
  const matchedTechnician = technicians.find(
    (technician) => technician.emailHash === budget.technicianEmailHash,
  );
  const technicianName =
    historicalTechnicianName ||
    (matchedTechnician
      ? `${matchedTechnician.firstName} ${matchedTechnician.lastName}`.trim()
      : budget.technicianEmailHash
        ? "Técnico no disponible"
        : "Sin seleccionar");
  const statusConfig = getStatusBadgeConfig(budget.status || "");
  const summary = getHistoricSummary(budget);
  const hasDiscount =
    (budget.user?.discount ?? 0) > 0 ||
    (budget.totalCouponDiscount ?? 0) > 0 ||
    (budget.price?.userDiscount ?? 0) > 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Cliente</p>
          <p className="mt-0.5 font-medium text-gray-900">{clientName}</p>
        </div>
        {budget.user?.phone && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Teléfono</p>
            <p className="mt-0.5 text-gray-900">{budget.user.phone}</p>
          </div>
        )}
        {budget.user?.email && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Email</p>
            <p className="mt-0.5 text-gray-900">{budget.user.email}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Fecha de creación</p>
          <p className="mt-0.5 text-gray-900">{formatDate(budget.creationDate ?? "")}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Fecha evento</p>
          <p className="mt-0.5 text-gray-900">{formatDate(budget.eventDate ?? "")}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Técnico</p>
          <p className="mt-0.5 text-gray-900">{technicianName}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Estado</p>
          <span className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusConfig.className}`}>
            {statusConfig.label}
          </span>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Dirección evento</p>
          <p className="mt-0.5 text-gray-900">{budget.address || "Recogida en almacén"}</p>
        </div>
      </div>

      {receipts.length > 0 && (
        <section aria-label="Facturas históricas" className="rounded-lg border border-gray-200 p-4 text-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Facturas históricas</p>
          <ul className="space-y-1 text-gray-700">
            {receipts.map((receipt, index) => (
              <li key={receipt.id ?? `${receipt.type}-${receipt.nfacture}-${index}`}>
                {receiptLabel(receipt)} Nº: {receipt.nfacture ?? "-"} Fecha factura: {formatDate(receipt.creationDate ?? "")}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Elemento</th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Uds.</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {budget.budgetLines?.length ? budget.budgetLines.map((line) => (
              <tr key={line.id}>
                <td className="px-4 py-3 text-gray-900">{line.nombre || line.elemento || "-"}</td>
                <td className="px-4 py-3 text-center text-gray-600">{line.units || line.unidades || 1}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">{formatHistoricAmount(line.totalPrice)}</td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="px-4 py-3 text-center text-gray-500">No hay productos en esta versión.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="ml-auto w-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm sm:w-72">
        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatHistoricAmount(budget.price?.subTotal)}</span></div>
        {hasDiscount && summary && <div className="mt-1 flex justify-between text-gray-600"><span>Subtotal con descuento</span><span>{formatCurrency(summary.discountedSubtotal)}</span></div>}
        <div className="mt-1 flex justify-between text-gray-600"><span>Extras</span><span>{formatHistoricAmount(budget.price?.extras)}</span></div>
        {budget.coupon && typeof budget.totalCouponDiscount === "number" && <div className="mt-1 flex justify-between text-red-600"><span>Cupón descuento ({budget.coupon.discount}%)</span><span>-{formatCurrency(budget.totalCouponDiscount)}</span></div>}
        <div className="mt-1 flex justify-between text-gray-600"><span>Gastos del envío</span><span>{formatHistoricAmount(budget.price?.costSend)}</span></div>
        <div className="mt-1 flex justify-between text-gray-600"><span>IVA (21%)</span><span>{summary ? formatCurrency(summary.vat) : "-"}</span></div>
        <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900"><span>Total</span><span>{summary ? formatCurrency(summary.total) : "-"}</span></div>
      </div>
    </div>
  );
};

export const ModalBudgetHistory: FC<ModalBudgetHistoryProps> = ({
  isOpen,
  historyId,
  onClose,
  entries,
  technicians,
  isLoading = false,
  error = null,
}) => {
  const [selection, setSelection] = useState<{
    historyId: number;
    entryKey: string;
  } | null>(null);
  const sortedEntries = useMemo(
    () => [...(entries ?? [])].sort((first, second) => Date.parse(second.historyDate) - Date.parse(first.historyDate)),
    [entries],
  );

  const selectedEntry =
    selection?.historyId === historyId
      ? sortedEntries.find(
          (entry, index) => getEntryKey(entry, index) === selection.entryKey,
        )
      : undefined;

  if (!isOpen) return null;

  return (
    <Modal title="Historial del presupuesto" onAccept={onClose} onClose={onClose} acceptText="Cerrar" cancelText="" maxWidthClass="max-w-5xl">
      {isLoading ? (
        <p role="status" className="py-8 text-center text-gray-500">Cargando historial...</p>
      ) : error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>
      ) : sortedEntries.length === 0 ? (
        <p className="py-8 text-center text-gray-500">Sin histórico.</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="max-h-[28rem] space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2" aria-label="Acciones históricas">
              {sortedEntries.map((entry, index) => {
                const entryKey = getEntryKey(entry, index);
                return (
                  <button
                    key={entryKey}
                    type="button"
                    onClick={() => setSelection({ historyId, entryKey })}
                    className={`w-full rounded-lg p-3 text-left transition-colors ${selection?.historyId === historyId && selection.entryKey === entryKey ? "bg-blue-50 ring-1 ring-blue-300" : "hover:bg-gray-50"}`}
                  >
                    <p className="font-medium text-gray-900">{eventTypeLabels[entry.eventType] ?? "-"}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatDateTime(entry.historyDate)}</p>
                  </button>
                );
              })}
          </div>
          <div>
            {selectedEntry ? <HistoricBudgetSnapshotDetails entry={selectedEntry} technicians={technicians} /> : <p className="py-8 text-center text-gray-500">Selecciona una acción para ver su versión histórica.</p>}
          </div>
        </div>
      )}
    </Modal>
  );
};
