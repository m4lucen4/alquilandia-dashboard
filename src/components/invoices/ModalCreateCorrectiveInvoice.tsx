import { type FC, useState } from "react";
import { Modal } from "../shared/Modal";
import type { Invoice } from "@/types/invoices";
import { formatCurrency, formatInvoiceNumber } from "@/helpers";

interface ModalCreateCorrectiveInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  invoice: Invoice | null;
  isCreating: boolean;
}

export const ModalCreateCorrectiveInvoice: FC<
  ModalCreateCorrectiveInvoiceProps
> = ({ isOpen, onClose, onConfirm, invoice, isCreating }) => {
  const [correctiveReason, setCorrectiveReason] = useState("");

  if (!isOpen || !invoice) return null;

  const handleConfirm = () => {
    onConfirm(correctiveReason);
  };

  return (
    <Modal
      title="Crear Factura Rectificativa"
      onAccept={handleConfirm}
      onClose={onClose}
      acceptDisabled={isCreating}
      acceptText={isCreating ? "Creando..." : "Crear Factura Rectificativa"}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          ¿Estás seguro de que deseas crear una factura rectificativa para la
          siguiente factura?
        </p>

        <div className="rounded-md bg-gray-50 p-4 ring-1 ring-gray-200">
          <dl className="space-y-2">
            <div className="flex justify-between text-sm">
              <dt className="font-medium text-gray-700">Nº Factura:</dt>
              <dd className="text-gray-900">
                {formatInvoiceNumber(
                  invoice.invoice_number,
                  invoice.created_at,
                )}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="font-medium text-gray-700">Nº Presupuesto:</dt>
              <dd className="text-gray-900">#{invoice.budget_reference}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="font-medium text-gray-700">Empresa:</dt>
              <dd className="text-gray-900">{invoice.business?.name || "-"}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="font-medium text-gray-700">Total:</dt>
              <dd className="font-semibold text-gray-900">
                {formatCurrency(invoice.price?.total || 0)}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <label
            htmlFor="corrective-reason"
            className="block text-sm font-medium text-gray-700"
          >
            Motivo de la rectificación (opcional)
          </label>
          <textarea
            id="corrective-reason"
            rows={3}
            value={correctiveReason}
            onChange={(e) => setCorrectiveReason(e.target.value)}
            placeholder="Escribe el motivo de la factura rectificativa..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isCreating}
          />
        </div>

        <div className="rounded-md bg-amber-50 p-4 ring-1 ring-amber-200">
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-amber-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Atención</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  La factura rectificativa tendrá el{" "}
                  <strong>mismo importe</strong> que la factura original pero
                  con valores <strong>negativos</strong> (devolución).
                </p>
              </div>
            </div>
          </div>
        </div>

        {isCreating && (
          <div className="flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <span className="ml-3 text-sm text-gray-600">
              Generando factura rectificativa...
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
