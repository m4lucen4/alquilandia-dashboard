import { type FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { resetWizard, goToStep } from "@/redux/slices/budgetWizardSlice";
import { budgetWizardCheckoutThunk, budgetWizardArchiveThunk } from "@/redux/actions/budgets";
import { Alert } from "@/components/shared/Alert";
import { CheckoutSummary } from "./step5/CheckoutSummary";
import { TransferPanel } from "./step5/TransferPanel";
import { AlquilandiaPanel } from "./step5/AlquilandiaPanel";

type ActivePanel = "transfer" | "alquilandia" | null;

export const BudgetStep5Checkout: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const { budget, budgetId, finalizeRequest, unavailableProducts } = useAppSelector(
    (state) => state.budgetWizard,
  );
  const currentUser = useAppSelector((state) => state.auth.user);
  const isAdminOrTechnician =
    currentUser?.role === "ADMIN" || currentUser?.role === "TECHNICIAN";

  useEffect(() => {
    if (finalizeRequest.ok) {
      dispatch(resetWizard());
      navigate("/budgets");
    }
  }, [finalizeRequest.ok, dispatch, navigate]);

  if (!budget || !budgetId) return null;

  const isLoading = finalizeRequest.inProgress;

  const togglePanel = (panel: ActivePanel) =>
    setActivePanel((prev) => (prev === panel ? null : panel));

  const handleArchive = () => {
    dispatch(budgetWizardArchiveThunk({ budgetId, data: { ...budget, status: "PAID_PENDING" } }));
  };

  const handleCheckout = (paymentType: "TRANSFER_PAID" | "RESERVED" | "PAID25") => {
    dispatch(budgetWizardCheckoutThunk({ budgetId, paymentType }));
  };

  return (
    <div className="flex flex-col gap-4">
      {finalizeRequest.messages && (
        <Alert
          title="Error al finalizar el presupuesto"
          description={
            unavailableProducts.length > 0
              ? `${finalizeRequest.messages} Productos afectados: ${unavailableProducts
                  .map((p) => p.name ?? p.elemento ?? "—")
                  .join(", ")}`
              : finalizeRequest.messages
          }
        />
      )}

      <CheckoutSummary budget={budget} />

      <div className="rounded-2xl bg-white p-6 shadow-sm flex flex-col gap-3">
        <h2 className="mb-1 text-base font-semibold text-gray-900">¿Qué deseas hacer?</h2>

        {/* Continuar comprando */}
        <button
          type="button"
          onClick={() => dispatch(goToStep(3))}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="text-lg">←</span>
          Continuar comprando
        </button>

        {/* Archivar */}
        <button
          type="button"
          onClick={handleArchive}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="text-lg">📁</span>
          Archivar presupuesto
          <span className="ml-auto text-xs text-gray-400">Guardar sin pagar</span>
        </button>

        {/* Transferencia bancaria */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => togglePanel("transfer")}
            disabled={isLoading}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition disabled:opacity-50 ${
              activePanel === "transfer"
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50"
            }`}
          >
            <span className="text-lg">🏦</span>
            Pago por transferencia bancaria
            <span className="ml-auto text-xs">{activePanel === "transfer" ? "▲" : "▼"}</span>
          </button>
          {activePanel === "transfer" && (
            <TransferPanel
              budget={budget}
              isLoading={isLoading}
              onConfirm={() => handleCheckout("TRANSFER_PAID")}
            />
          )}
        </div>

        {/* Pago Alquilandia — solo ADMIN/TECHNICIAN */}
        {isAdminOrTechnician && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => togglePanel("alquilandia")}
              disabled={isLoading}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition disabled:opacity-50 ${
                activePanel === "alquilandia"
                  ? "border-purple-300 bg-purple-50 text-purple-700"
                  : "border-gray-200 text-gray-700 hover:border-purple-200 hover:bg-purple-50"
              }`}
            >
              <span className="text-lg">⚡</span>
              Pago Alquilandia
              <span className="ml-auto text-xs text-gray-400">Solo administradores</span>
              <span className="text-xs">{activePanel === "alquilandia" ? "▲" : "▼"}</span>
            </button>
            {activePanel === "alquilandia" && (
              <AlquilandiaPanel
                isLoading={isLoading}
                onReserve={() => handleCheckout("RESERVED")}
                onPaid25={() => handleCheckout("PAID25")}
              />
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4 text-sm text-gray-500">
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Procesando...
        </div>
      )}
    </div>
  );
};
