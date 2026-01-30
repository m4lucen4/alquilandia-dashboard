import { type FC } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Modal } from "../shared/Modal";
import type { Invoice } from "../../types/invoices";
import { formatDate } from "@/helpers/dates";
import { formatCurrency } from "@/helpers";

interface ModalInvoiceDataProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const ModalInvoiceData: FC<ModalInvoiceDataProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <Modal
      title="Datos de la Factura"
      onAccept={onClose}
      onClose={onClose}
      acceptText="Cerrar"
      cancelText=""
    >
      <div className="space-y-6">
        {/* Invoice Header */}
        <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
          <div>
            <p className="text-xs text-gray-500">Nº Factura</p>
            <p className="text-lg font-semibold text-gray-900">
              #{invoice.invoice_number}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Nº Presupuesto</p>
            <p className="text-lg font-semibold text-gray-900">
              #{invoice.budget_reference}
            </p>
          </div>
        </div>

        {/* Download PDF Button */}
        {invoice.pdf_url && (
          <div className="flex justify-center">
            <a
              href={invoice.pdf_url}
              download={`factura_${invoice.invoice_number}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Descargar PDF
            </a>
          </div>
        )}

        {/* Business Information */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-900">
            Empresa Emisora
          </h4>
          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <p className="font-medium text-gray-900">
              {invoice.business?.name}
            </p>
            {invoice.business?.nif && (
              <p className="text-gray-600">NIF: {invoice.business.nif}</p>
            )}
            {invoice.business?.address && (
              <p className="text-gray-600">{invoice.business.address}</p>
            )}
            {invoice.business?.locality && (
              <p className="text-gray-600">
                {invoice.business.postal_code} {invoice.business.locality},{" "}
                {invoice.business.province}
              </p>
            )}
            {invoice.business?.phone && (
              <p className="text-gray-600">Tel: {invoice.business.phone}</p>
            )}
          </div>
        </div>

        {/* Invoice Type and Tax Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900">
              Tipo de Factura
            </h4>
            <div className="rounded-lg bg-blue-50 p-3 text-sm">
              <p className="font-medium text-blue-900">
                {invoice.invoices_type?.invoices}
              </p>
              <p className="text-blue-700">
                {invoice.invoices_type?.percentage}%
              </p>
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900">
              Tipo de Impuesto
            </h4>
            <div className="rounded-lg bg-green-50 p-3 text-sm">
              <p className="font-medium text-green-900">
                {invoice.taxes_type?.name}
              </p>
              <p className="text-green-700">{invoice.taxes_type?.tax}%</p>
            </div>
          </div>
        </div>

        {/* Price Information */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-900">
            Información de Precio
          </h4>
          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(invoice.price?.subTotal || 0)}
              </span>
            </div>
            {invoice.price?.vat !== undefined && (
              <div className="flex justify-between py-1">
                <span className="text-gray-600">IVA:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(invoice.price.vat)}
                </span>
              </div>
            )}
            {invoice.price?.extras !== undefined &&
              invoice.price.extras > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Extras:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(invoice.price.extras)}
                  </span>
                </div>
              )}
            {invoice.price?.userDiscount !== undefined &&
              invoice.price.userDiscount > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Descuento:</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(invoice.price.userDiscount)}
                  </span>
                </div>
              )}
            <div className="mt-2 flex justify-between border-t border-gray-300 pt-2">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(invoice.price?.total || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Creation Date */}
        <div className="text-center text-xs text-gray-500">
          Factura generada el{" "}
          {invoice.created_at && formatDate(invoice.created_at)}
        </div>
      </div>
    </Modal>
  );
};
