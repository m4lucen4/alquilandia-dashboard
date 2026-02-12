import { type FC, useMemo } from "react";
import { Modal } from "../shared/Modal";
import SelectField from "../shared/SelectField";
import type { Invoice } from "@/types/invoices";
import type { Business } from "@/types/business";
import type { InvoicesType } from "@/types/invoicesTypes";
import type { TaxesType } from "@/types/taxesTypes";
import { formatInvoiceNumber } from "@/helpers";

interface ModalEditInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  invoice: Invoice | null;
  businesses: Business[];
  invoicesTypes: InvoicesType[];
  taxesTypes: TaxesType[];
  selectedBusinessId: string;
  selectedInvoicesTypeId: string;
  setSelectedInvoicesTypeId: (value: string) => void;
  selectedTaxesTypeId: string;
  setSelectedTaxesTypeId: (value: string) => void;
  additionalData: string;
  setAdditionalData: (value: string) => void;
  createdAt: string;
  setCreatedAt: (value: string) => void;
  isUpdating: boolean;
}

export const ModalEditInvoice: FC<ModalEditInvoiceProps> = ({
  isOpen,
  onClose,
  onSave,
  invoice,
  businesses,
  invoicesTypes,
  taxesTypes,
  selectedBusinessId,
  selectedInvoicesTypeId,
  setSelectedInvoicesTypeId,
  selectedTaxesTypeId,
  setSelectedTaxesTypeId,
  additionalData,
  setAdditionalData,
  createdAt,
  setCreatedAt,
  isUpdating,
}) => {
  const invoiceTypeOptions = useMemo(
    () =>
      invoicesTypes.map((invoiceType) => ({
        value: invoiceType.id,
        label: `${invoiceType.invoices} (${invoiceType.percentage}%)`,
      })),
    [invoicesTypes],
  );

  const taxTypeOptions = useMemo(
    () =>
      taxesTypes.map((taxType) => ({
        value: taxType.id,
        label: `${taxType.name} (${taxType.tax}%)`,
      })),
    [taxesTypes],
  );

  if (!isOpen || !invoice) return null;

  const isFormValid =
    selectedBusinessId &&
    selectedInvoicesTypeId &&
    selectedTaxesTypeId &&
    createdAt;

  return (
    <Modal
      title="Editar Factura"
      onAccept={onSave}
      onClose={onClose}
      acceptText={isUpdating ? "Guardando..." : "Guardar cambios"}
      acceptDisabled={!isFormValid || isUpdating}
    >
      <div className="space-y-4">
        <div className="rounded-md bg-gray-50 p-3 ring-1 ring-gray-200">
          <p className="text-sm text-gray-700">
            Factura{" "}
            <span className="font-semibold text-gray-900">
              {formatInvoiceNumber(invoice.invoice_number, invoice.created_at)}
            </span>{" "}
            &mdash; Presupuesto{" "}
            <span className="font-semibold text-gray-900">
              #{invoice.budget_reference}
            </span>
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Empresa
            </label>
            <input
              type="text"
              value={
                businesses.find((b) => b.id === selectedBusinessId)?.name || ""
              }
              disabled
              className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 shadow-sm cursor-not-allowed"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="edit-created-at"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Fecha de creaci&oacute;n
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              id="edit-created-at"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              disabled={isUpdating}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
        </div>

        <SelectField
          label="Tipo de Factura"
          name="edit-invoices-type"
          value={selectedInvoicesTypeId}
          onChange={(e) => setSelectedInvoicesTypeId(e.target.value)}
          options={invoiceTypeOptions}
          placeholder="Selecciona un tipo de factura"
          required
          disabled={isUpdating}
          emptyMessage="No hay tipos de factura disponibles."
          className="mb-4"
        />

        <SelectField
          label="Tipo de Impuesto"
          name="edit-taxes-type"
          value={selectedTaxesTypeId}
          onChange={(e) => setSelectedTaxesTypeId(e.target.value)}
          options={taxTypeOptions}
          placeholder="Selecciona un tipo de impuesto"
          required
          disabled={isUpdating}
          emptyMessage="No hay tipos de impuesto disponibles."
        />

        <div>
          <label
            htmlFor="edit-additional-data"
            className="block text-sm font-medium text-gray-900"
          >
            Datos adicionales (opcional)
          </label>
          <textarea
            id="edit-additional-data"
            rows={3}
            value={additionalData}
            onChange={(e) => setAdditionalData(e.target.value)}
            placeholder="Informaci&oacute;n adicional que aparecer&aacute; en la factura..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            disabled={isUpdating}
          />
        </div>

        {isUpdating && (
          <div className="flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <span className="ml-3 text-sm text-gray-600">
              Actualizando factura...
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
