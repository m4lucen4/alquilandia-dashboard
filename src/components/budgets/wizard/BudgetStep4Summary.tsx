import { type FC, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCatalogStockThunk, updateBudgetLinesThunk } from "@/redux/actions/budgets";
import { fetchDiscountsThunk } from "@/redux/actions/discounts";
import { fetchShippingCosts } from "@/redux/actions/shippingCosts";
import {
  recalculatePrice,
  removeBudgetLine,
  updateBudgetLineValues,
  calculateCostSend,
} from "@/helpers/budgetLines";
import type { Extra } from "@/types/budgets";
import { Alert } from "@/components/shared/Alert";
import { SummaryHeader } from "./step4/SummaryHeader";
import { SummaryOptions } from "./step4/SummaryOptions";
import { SummaryAmounts } from "./step4/SummaryAmounts";
import { SummaryLineRow } from "./step4/SummaryLineRow";

export const BudgetStep4Summary: FC = () => {
  const dispatch = useAppDispatch();

  const { budget, budgetId, stockByProductId, updateLinesRequest } =
    useAppSelector((state) => state.budgetWizard);
  const { shippingCosts } = useAppSelector((state) => state.shippingCosts);
  const { discounts } = useAppSelector((state) => state.discounts);
  const currentUser = useAppSelector((state) => state.auth.user);

  const showAdminControls =
    currentUser?.role === "ADMIN" || currentUser?.role === "TECHNICIAN";

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!shippingCosts) dispatch(fetchShippingCosts());
    if (discounts.length === 0) dispatch(fetchDiscountsThunk());
    if (budgetId && budget?.budgetLines?.length) {
      dispatch(
        fetchCatalogStockThunk({
          budgetId,
          productIds: budget.budgetLines.map((l) => l.id),
        }),
      );
    }
  }, [dispatch, budgetId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!shippingCosts || !budget || !budgetId) return;
    if ((budget.budgetLines?.length ?? 0) === 0) return;
    const expected = calculateCostSend(budget, shippingCosts);
    if (expected === budget.price.costSend) return;
    const newBudget = recalculatePrice(budget, shippingCosts);
    dispatch(updateBudgetLinesThunk({ budgetId, data: newBudget }));
  }, [shippingCosts]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers de disponibilidad ──────────────────────────────────────────────
  const getMaxUnits = useCallback(
    (lineId: string, lineUnidades: number): number => {
      const blocked = stockByProductId[lineId] ?? 0;
      return lineUnidades - blocked;
    },
    [stockByProductId],
  );

  // ── Handlers de mutación (todos → updateBudgetLinesThunk) ─────────────────
  const handleUpdateLine = useCallback(
    (lineId: string, patch: { units?: number; descuento?: number; extras?: Extra[] }) => {
      if (!budget || !budgetId) return;
      const newBudget = updateBudgetLineValues(budget, lineId, patch, shippingCosts);
      dispatch(updateBudgetLinesThunk({ budgetId, data: newBudget }));
    },
    [budget, budgetId, shippingCosts, dispatch],
  );

  const handleRemoveLine = useCallback(
    (lineId: string) => {
      if (!budget || !budgetId) return;
      const newBudget = removeBudgetLine(budget, lineId, shippingCosts);
      dispatch(updateBudgetLinesThunk({ budgetId, data: newBudget }));
    },
    [budget, budgetId, shippingCosts, dispatch],
  );

  const handleToggleNosend = useCallback(() => {
    if (!budget || !budgetId) return;
    const newBudget = recalculatePrice({ ...budget, nosend: !budget.nosend }, shippingCosts);
    dispatch(updateBudgetLinesThunk({ budgetId, data: newBudget }));
  }, [budget, budgetId, shippingCosts, dispatch]);

  const handleToggleIVA = useCallback(() => {
    if (!budget || !budgetId) return;
    const newBudget = recalculatePrice(
      { ...budget, price: { ...budget.price, withIVA: !budget.price.withIVA } },
      shippingCosts,
    );
    dispatch(updateBudgetLinesThunk({ budgetId, data: newBudget }));
  }, [budget, budgetId, shippingCosts, dispatch]);

  const isSaving = updateLinesRequest.inProgress;
  const isDisabled = isSaving || !shippingCosts;
  const lines = budget?.budgetLines ?? [];

  if (!budget) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Errores */}
      {updateLinesRequest.messages && (
        <Alert title="Error al guardar" description={updateLinesRequest.messages} />
      )}

      {/* Cabecera: datos del presupuesto */}
      <SummaryHeader budget={budget} />

      {/* Opciones: nosend e IVA */}
      <SummaryOptions
        nosend={budget.nosend}
        withIVA={budget.price.withIVA}
        showIVAToggle={showAdminControls}
        isDisabled={isDisabled}
        onToggleNosend={handleToggleNosend}
        onToggleIVA={handleToggleIVA}
      />

      {/* Líneas */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Artículos ({lines.length})
        </h2>
        {lines.length === 0 ? (
          <p className="text-sm text-gray-400">No hay artículos en el presupuesto.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {lines.map((line) => (
              <SummaryLineRow
                key={line.id}
                line={line}
                maxUnits={getMaxUnits(line.id, line.unidades)}
                discounts={discounts}
                showDiscount={showAdminControls}
                isSaving={isSaving}
                onUpdate={handleUpdateLine}
                onRemove={handleRemoveLine}
              />
            ))}
          </div>
        )}
      </div>

      {/* Importes */}
      <SummaryAmounts budget={budget} />

    </div>
  );
};
