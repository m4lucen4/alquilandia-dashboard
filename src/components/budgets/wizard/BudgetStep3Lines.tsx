import { type FC } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { goBackStep } from "@/redux/slices/budgetWizardSlice";
import Button from "@/components/shared/Button";

export const BudgetStep3Lines: FC = () => {
  const dispatch = useAppDispatch();

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <p>Este es el paso 3, estamos trabajando en las líneas del presupuesto</p>

      <div className="mt-6 flex justify-start">
        <Button
          title="Volver"
          onClick={() => dispatch(goBackStep())}
          variant="secondary"
          type="button"
        />
      </div>
    </div>
  );
};
