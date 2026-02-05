import { type FC, useMemo, useState, useEffect } from "react";
import { Modal } from "../shared/Modal";
import SelectField from "../shared/SelectField";
import type { Budget } from "../../types/budgets";
import type { Business } from "../../types/business";
import type { InvoicesType } from "../../types/invoicesTypes";
import type { TaxesType } from "../../types/taxesTypes";
import Button from "../shared/Button";

interface ModalGenerateInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: () => void;
  selectedBudget: Budget | null;
  businesses: Business[];
  invoicesTypes: InvoicesType[];
  taxesTypes: TaxesType[];
  selectedBusinessId: string;
  setSelectedBusinessId: (value: string) => void;
  selectedInvoicesTypeId: string;
  setSelectedInvoicesTypeId: (value: string) => void;
  selectedTaxesTypeId: string;
  setSelectedTaxesTypeId: (value: string) => void;
  invoiceTo: "titular" | "empresa";
  setInvoiceTo: (value: "titular" | "empresa") => void;
  additionalData: string;
  setAdditionalData: (value: string) => void;
  isGenerating: boolean;
}

export const ModalGenerateInvoice: FC<ModalGenerateInvoiceProps> = ({
  isOpen,
  onClose,
  onGenerate,
  selectedBudget,
  businesses,
  invoicesTypes,
  taxesTypes,
  selectedBusinessId,
  setSelectedBusinessId,
  selectedInvoicesTypeId,
  setSelectedInvoicesTypeId,
  selectedTaxesTypeId,
  setSelectedTaxesTypeId,
  invoiceTo,
  setInvoiceTo,
  additionalData,
  setAdditionalData,
  isGenerating,
}) => {
  // Memoize options to avoid recreating on every render
  const businessOptions = useMemo(
    () =>
      businesses.map((business) => ({
        value: business.id,
        label: business.name,
      })),
    [businesses],
  );

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

  const [showBusinessSelect, setShowBusinessSelect] = useState(false);

  // Set default invoiceTo to 'empresa' when modal opens with company data
  useEffect(() => {
    if (
      isOpen &&
      selectedBudget?.user?.company?.name &&
      selectedBudget?.user?.company?.nif
    ) {
      setInvoiceTo("empresa");
    }
  }, [isOpen, selectedBudget, setInvoiceTo]);

  // Reset state when modal closes
  const handleClose = () => {
    setShowBusinessSelect(false);
    onClose();
  };

  // Early return after all hooks have been called
  if (!isOpen || !selectedBudget) return null;

  const isFormValid =
    selectedBusinessId && selectedInvoicesTypeId && selectedTaxesTypeId;

  return (
    <Modal
      title="Generar Factura"
      onAccept={onGenerate}
      onClose={handleClose}
      acceptDisabled={!isFormValid || isGenerating}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Selecciona los datos necesarios para generar la factura del
          presupuesto{" "}
          <span className="font-semibold">
            #{selectedBudget.budgetReference}
          </span>
        </p>

        {selectedBudget.user?.company?.name &&
          selectedBudget.user?.company?.nif && (
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Factura a nombre de
              </label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="invoiceTo"
                    checked={invoiceTo === "titular"}
                    onChange={() => setInvoiceTo("titular")}
                    disabled={isGenerating}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">Titular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="invoiceTo"
                    checked={invoiceTo === "empresa"}
                    onChange={() => setInvoiceTo("empresa")}
                    disabled={isGenerating}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    {selectedBudget.user.company.name}
                  </span>
                </label>
              </div>
            </div>
          )}

        {!showBusinessSelect && selectedBusinessId ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">
              Empresa<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-900">
                {
                  businessOptions.find((o) => o.value === selectedBusinessId)
                    ?.label
                }
              </span>
              <Button
                onClick={() => setShowBusinessSelect(true)}
                disabled={isGenerating}
                className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                title="Cambiar empresa"
                variant="ghost"
              />
            </div>
          </div>
        ) : (
          <SelectField
            label="Empresa"
            name="business"
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            options={businessOptions}
            placeholder="Selecciona una empresa"
            required
            disabled={isGenerating}
            emptyMessage="No hay empresas disponibles. Crea una empresa en Ajustes."
            className="mb-4"
          />
        )}

        <SelectField
          label="Tipo de Factura"
          name="invoices-type"
          value={selectedInvoicesTypeId}
          onChange={(e) => setSelectedInvoicesTypeId(e.target.value)}
          options={invoiceTypeOptions}
          placeholder="Selecciona un tipo de factura"
          required
          disabled={isGenerating}
          emptyMessage="No hay tipos de factura disponibles. Crea uno en Ajustes."
          className="mb-4"
        />

        <SelectField
          label="Tipo de Impuesto"
          name="taxes-type"
          value={selectedTaxesTypeId}
          onChange={(e) => setSelectedTaxesTypeId(e.target.value)}
          options={taxTypeOptions}
          placeholder="Selecciona un tipo de impuesto"
          required
          disabled={isGenerating}
          emptyMessage="No hay tipos de impuesto disponibles. Crea uno en Ajustes."
        />

        <div>
          <label
            htmlFor="additional-data"
            className="block text-sm font-medium text-gray-900"
          >
            Datos adicionales (opcional)
          </label>
          <textarea
            id="additional-data"
            rows={3}
            value={additionalData}
            onChange={(e) => setAdditionalData(e.target.value)}
            placeholder="Información adicional que aparecerá en la factura..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            disabled={isGenerating}
          />
        </div>

        {isGenerating && (
          <div className="mt-4 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <span className="ml-3 text-sm text-gray-600">
              Generando factura...
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
