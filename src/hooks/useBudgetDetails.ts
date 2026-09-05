import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBudgets, rejectBudgetThunk, updateBudgetThunk } from "@/redux/actions/budgets";
import { fetchUserDetails } from "@/redux/actions/users";
import { useAppDispatch } from "@/redux/hooks";
import { rescueBudget, resetWizard } from "@/redux/slices/budgetWizardSlice";
import { getBudgetById } from "@/services/budgetsServices";
import type { Budget, User } from "@/types/budgets";

export interface BudgetDetailsFeedback {
  title: string;
  description: string;
}

interface UseBudgetDetailsProps {
  pageIndex: number;
  pageSize: number;
  buildFiltersQuery: () => string;
}

export const useBudgetDetails = ({
  pageIndex,
  pageSize,
  buildFiltersQuery,
}: UseBudgetDetailsProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isViewBudgetModalOpen, setIsViewBudgetModalOpen] = useState(false);
  const [selectedBudgetToView, setSelectedBudgetToView] = useState<Budget | null>(null);
  const [selectedUserToView, setSelectedUserToView] = useState<User | null>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [budgetDetailsFeedback, setBudgetDetailsFeedback] =
    useState<BudgetDetailsFeedback | null>(null);

  const handleViewBudget = useCallback(
    async (budget: Budget) => {
      setLoadingBudget(true);
      try {
        const freshUser = await dispatch(fetchUserDetails(budget.user.id)).unwrap();
        setSelectedUserToView(freshUser);
        setSelectedBudgetToView(budget);
        setIsViewBudgetModalOpen(true);
      } catch (error) {
        console.error("Error loading user details:", error);
      } finally {
        setLoadingBudget(false);
      }
    },
    [dispatch],
  );

  const handleCloseViewBudgetModal = useCallback(() => {
    setIsViewBudgetModalOpen(false);
    setSelectedBudgetToView(null);
    setSelectedUserToView(null);
  }, []);

  const handleRescueBudget = useCallback(async () => {
    if (!selectedBudgetToView) return;
    const budgetFromList = selectedBudgetToView;
    handleCloseViewBudgetModal();
    dispatch(resetWizard());
    try {
      const freshBudget = await getBudgetById(budgetFromList.id);
      const withIVA = freshBudget.price?.withIVA || budgetFromList.price?.withIVA;
      dispatch(
        rescueBudget({
          ...budgetFromList,
          price: { ...budgetFromList.price, withIVA },
        }),
      );
    } catch {
      dispatch(rescueBudget(budgetFromList));
    }
    navigate("/budgets/new");
  }, [dispatch, handleCloseViewBudgetModal, navigate, selectedBudgetToView]);

  const handleRejectBudget = useCallback(async () => {
    if (!selectedBudgetToView) return;
    const result = await dispatch(rejectBudgetThunk(selectedBudgetToView.id));
    if (rejectBudgetThunk.fulfilled.match(result)) {
      handleCloseViewBudgetModal();
      dispatch(
        fetchBudgets({
          pageSize,
          pageToFetch: pageIndex + 1,
          filtersQuery: buildFiltersQuery(),
        }),
      );
    }
  }, [
    buildFiltersQuery,
    dispatch,
    handleCloseViewBudgetModal,
    pageIndex,
    pageSize,
    selectedBudgetToView,
  ]);

  const handleValidateBudget = useCallback(async () => {
    if (!selectedBudgetToView) return;

    const budgetToUpdate = { ...selectedBudgetToView, status: "PAID" };
    const result = await dispatch(
      updateBudgetThunk({
        budgetId: selectedBudgetToView.id,
        data: budgetToUpdate,
      }),
    );

    if (updateBudgetThunk.fulfilled.match(result)) {
      try {
        const freshBudget = await getBudgetById(selectedBudgetToView.id);
        setSelectedBudgetToView(freshBudget);
      } catch {
        setSelectedBudgetToView(result.payload);
      }

      dispatch(
        fetchBudgets({
          pageSize,
          pageToFetch: pageIndex + 1,
          filtersQuery: buildFiltersQuery(),
        }),
      );
      setBudgetDetailsFeedback({
        title: "Presupuesto validado",
        description: `El presupuesto ${budgetToUpdate.budgetReference} ha sido marcado como pagado`,
      });
      return;
    }

    setBudgetDetailsFeedback({
      title: "Error al validar presupuesto",
      description:
        typeof result.payload === "string"
          ? result.payload
          : "No se pudo validar el presupuesto",
    });
  }, [buildFiltersQuery, dispatch, pageIndex, pageSize, selectedBudgetToView]);

  const clearBudgetDetailsFeedback = useCallback(() => {
    setBudgetDetailsFeedback(null);
  }, []);

  const showBudgetDetailsFeedback = useCallback(
    (feedback: BudgetDetailsFeedback) => {
      setBudgetDetailsFeedback(feedback);
    },
    [],
  );

  return {
    isViewBudgetModalOpen,
    selectedBudgetToView,
    selectedUserToView,
    loadingBudget,
    handleViewBudget,
    handleCloseViewBudgetModal,
    handleRescueBudget,
    handleRejectBudget,
    handleValidateBudget,
    budgetDetailsFeedback,
    clearBudgetDetailsFeedback,
    showBudgetDetailsFeedback,
  };
};
