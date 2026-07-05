import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { resetWizard, goBackStep, goNextStep } from "@/redux/slices/budgetWizardSlice";
import { BudgetStep1Client } from "@/components/budgets/wizard/BudgetStep1Client";
import { BudgetStep2EventDetails } from "@/components/budgets/wizard/BudgetStep2EventDetails";
import { BudgetStep3Lines } from "@/components/budgets/wizard/BudgetStep3Lines";
import { BudgetStep4Summary } from "@/components/budgets/wizard/BudgetStep4Summary";
import { BudgetStep5Checkout } from "@/components/budgets/wizard/BudgetStep5Checkout";
import Button from "@/components/shared/Button";

const TOTAL_STEPS = 5;

export const CreateBudgetPage: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { step, budget, updateLinesRequest } = useAppSelector(
    (state) => state.budgetWizard,
  );

  const handleCancel = () => {
    dispatch(resetWizard());
    navigate("/budgets");
  };

  // Navegación superior solo para steps 3+ (steps 1-2 usan sus propios botones de formulario)
  // Step 5 tiene sus propios botones de acción — solo muestra Volver
  const showTopNav = step >= 3;
  const showContinuar = step >= 3 && step < 5;
  const hasLines = (budget?.budgetLines?.length ?? 0) > 0;
  const isSaving = updateLinesRequest.inProgress;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">Nuevo presupuesto</h1>
          <p className="mt-2 text-sm text-gray-600">
            Paso {step} de {TOTAL_STEPS}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showTopNav && (
            <>
              <Button
                title="Volver"
                onClick={() => dispatch(goBackStep())}
                variant="secondary"
                type="button"
              />
              {showContinuar && (
                <Button
                  title="Continuar"
                  onClick={() => dispatch(goNextStep())}
                  variant="primary"
                  type="button"
                  disabled={!hasLines || isSaving}
                />
              )}
            </>
          )}
          <div className="ml-4 border-l border-gray-300 pl-4">
            <Button title="Cancelar" onClick={handleCancel} variant="danger" />
          </div>
        </div>
      </div>

      <div className="mb-8 flex gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-blue-600" : "bg-gray-200"}`}
          />
        ))}
      </div>

      {step === 1 && <BudgetStep1Client />}
      {step === 2 && <BudgetStep2EventDetails />}
      {step === 3 && <BudgetStep3Lines />}
      {step === 4 && <BudgetStep4Summary />}
      {step === 5 && <BudgetStep5Checkout />}
    </div>
  );
};
