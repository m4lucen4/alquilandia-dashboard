import { type FC } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Modal } from "../shared/Modal";
import type { Invoice } from "../../types/invoices";
import { formatCurrency } from "@/helpers";

interface ModalInvoiceDataProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
}

export const ModalInvoiceData: FC<ModalInvoiceDataProps> = ({
  isOpen,
  onClose,
  invoices,
}) => {
  if (!isOpen || invoices.length === 0) return null;

  return (
    <Modal
      title="Facturas del Presupuesto"
      onAccept={onClose}
      onClose={onClose}
      acceptText="Cerrar"
      cancelText=""
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Listado de facturas asociadas al presupuesto{" "}
          <span className="font-semibold">#{invoices[0].budget_reference}</span>
        </p>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Nº Factura
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Empresa
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Importe
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                    #{invoice.invoice_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {invoice.business?.name || "-"}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-right text-sm font-semibold ${
                      invoice.is_corrective
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {formatCurrency(invoice.price?.total || 0)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                    {invoice.is_corrective ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Rectificativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    {invoice.pdf_url ? (
                      <a
                        href={invoice.pdf_url}
                        download={`factura_${invoice.invoice_number}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        title="Descargar PDF"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Sin PDF</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
          <p className="font-medium">Total de facturas: {invoices.length}</p>
        </div>
      </div>
    </Modal>
  );
};
