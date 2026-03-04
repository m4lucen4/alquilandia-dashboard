import { type FC, useMemo, useState, useEffect } from "react";
import { Modal } from "../shared/Modal";
import type { Budget } from "../../types/budgets";
import type { Business } from "../../types/business";
import Button from "../shared/Button";

interface ModalGenerateBudgetPdfProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: () => void;
  selectedBudget: Budget | null;
  businesses: Business[];
  selectedBusinessId: string;
  setSelectedBusinessId: (value: string) => void;
  invoiceTo: "titular" | "empresa";
  setInvoiceTo: (value: "titular" | "empresa") => void;
  date: string;
  setDate: (value: string) => void;
  includeVAT: boolean;
  setIncludeVAT: (value: boolean) => void;
  isGenerating: boolean;
}

export const ModalGenerateBudgetPdf: FC<ModalGenerateBudgetPdfProps> = ({
  isOpen,
  onClose,
  onGenerate,
  selectedBudget,
  businesses,
  selectedBusinessId,
  setSelectedBusinessId,
  invoiceTo,
  setInvoiceTo,
  date,
  setDate,
  includeVAT,
  setIncludeVAT,
  isGenerating,
}) => {
  const businessOptions = useMemo(
    () =>
      businesses.map((business) => ({
        value: business.id,
        label: business.name,
      })),
    [businesses],
  );

  const [showBusinessSelect, setShowBusinessSelect] = useState(false);

  useEffect(() => {
    if (
      isOpen &&
      selectedBudget?.user?.company?.name &&
      selectedBudget?.user?.company?.nif
    ) {
      setInvoiceTo("empresa");
    }
  }, [isOpen, selectedBudget, setInvoiceTo]);

  const handleClose = () => {
    setShowBusinessSelect(false);
    onClose();
  };

  if (!isOpen || !selectedBudget) return null;

  const isFormValid = selectedBusinessId && date;

  return (
    <Modal
      title="Generar PDF del presupuesto"
      onAccept={onGenerate}
      onClose={handleClose}
      acceptText={isGenerating ? "Generando..." : "Descargar PDF"}
      acceptDisabled={!isFormValid || isGenerating}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Genera el PDF del presupuesto{" "}
          <span className="font-semibold">#{selectedBudget.budgetReference}</span>
        </p>

        {selectedBudget.user?.company?.name &&
          selectedBudget.user?.company?.nif && (
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Presupuesto a nombre de
              </label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="budgetPdfTo"
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
                    name="budgetPdfTo"
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

        <div className="flex gap-4">
          {!showBusinessSelect && selectedBusinessId ? (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900">
                Empresa<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-900">
                  {businessOptions.find((o) => o.value === selectedBusinessId)?.label}
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
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Empresa<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="budget-pdf-business"
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                disabled={isGenerating}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="">Selecciona una empresa</option>
                {businessOptions.length === 0 ? (
                  <option disabled>
                    No hay empresas disponibles. Crea una empresa en Ajustes.
                  </option>
                ) : (
                  businessOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          <div className="flex-1">
            <label
              htmlFor="budget-pdf-date"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Fecha<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              id="budget-pdf-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isGenerating}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={includeVAT}
            onClick={() => setIncludeVAT(!includeVAT)}
            disabled={isGenerating}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              includeVAT ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                includeVAT ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <label className="text-sm font-medium text-gray-900">
            Incluir IVA (21%)
          </label>
        </div>

        {isGenerating && (
          <div className="mt-4 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <span className="ml-3 text-sm text-gray-600">
              Generando PDF...
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
