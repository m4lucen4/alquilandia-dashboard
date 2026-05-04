import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { resetWizard } from "@/redux/slices/budgetWizardSlice";
import { BudgetStep1Client } from "@/components/budgets/wizard/BudgetStep1Client";
import { BudgetStep2EventDetails } from "@/components/budgets/wizard/BudgetStep2EventDetails";
import Button from "@/components/shared/Button";

const TOTAL_STEPS = 5;

export const CreateBudgetPage: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { step } = useAppSelector((state) => state.budgetWizard);

  const handleCancel = () => {
    dispatch(resetWizard());
    navigate("/budgets");
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo presupuesto</h1>
          <p className="mt-2 text-sm text-gray-600">
            Paso {step} de {TOTAL_STEPS}
          </p>
        </div>
        <Button title="Cancelar" onClick={handleCancel} variant="secondary" />
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
    </div>
  );
};
