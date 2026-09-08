import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBudgets, rejectBudgetThunk, updateBudgetThunk } from "@/redux/actions/budgets";
import { fetchUserDetails } from "@/redux/actions/users";
import { useAppDispatch } from "@/redux/hooks";
import { rescueBudget, resetWizard } from "@/redux/slices/budgetWizardSlice";
import {
  getBudgetById,
  getBudgetDetailsByRecordId,
} from "@/services/budgetsServices";
import type { Budget, User } from "@/types/budgets";

export interface BudgetDetailsFeedback {
  title: string;
  description: string;
  type: "success" | "error";
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
  const [isPostponing, setIsPostponing] = useState(false);
  const isPostponingRef = useRef(false);
  const viewIdRef = useRef(0);

  const handleViewBudget = useCallback(
    async (budget: Budget) => {
      const viewId = viewIdRef.current + 1;
      viewIdRef.current = viewId;
      isPostponingRef.current = false;
      setIsPostponing(false);
      setLoadingBudget(true);
      setBudgetDetailsFeedback(null);
      try {
        const freshUser = await dispatch(fetchUserDetails(budget.user.id)).unwrap();
        if (viewId !== viewIdRef.current) return;
        setSelectedUserToView(freshUser);
        setSelectedBudgetToView(budget);
        setIsViewBudgetModalOpen(true);
      } catch (error) {
        console.error("Error loading user details:", error);
      } finally {
        if (viewId === viewIdRef.current) {
          setLoadingBudget(false);
        }
      }
    },
    [dispatch],
  );

  const handleCloseViewBudgetModal = useCallback(() => {
    viewIdRef.current += 1;
    isPostponingRef.current = false;
    setIsPostponing(false);
    setIsViewBudgetModalOpen(false);
    setSelectedBudgetToView(null);
    setSelectedUserToView(null);
    setBudgetDetailsFeedback(null);
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
        type: "success",
      });
      return;
    }

    setBudgetDetailsFeedback({
      title: "Error al validar presupuesto",
      description:
        typeof result.payload === "string"
          ? result.payload
          : "No se pudo validar el presupuesto",
      type: "error",
    });
  }, [buildFiltersQuery, dispatch, pageIndex, pageSize, selectedBudgetToView]);

  const handlePostponeBudget = useCallback(async () => {
    if (!selectedBudgetToView || isPostponingRef.current) return;

    const viewId = viewIdRef.current;
    isPostponingRef.current = true;
    setIsPostponing(true);
    setBudgetDetailsFeedback(null);

    try {
      const freshBudget = await getBudgetDetailsByRecordId(selectedBudgetToView.id);
      if (viewId !== viewIdRef.current) return;

      if (freshBudget.id !== selectedBudgetToView.id) {
        setBudgetDetailsFeedback({
          title: "Error al posponer presupuesto",
          description: "El detalle obtenido no corresponde al presupuesto seleccionado",
          type: "error",
        });
        return;
      }

      if (!["PAID25", "PAID", "TRANSFER_PAID"].includes(freshBudget.status)) {
        setBudgetDetailsFeedback({
          title: "No se puede posponer el presupuesto",
          description: `El presupuesto ${freshBudget.budgetReference} ya no tiene un estado apto para posponerlo`,
          type: "error",
        });
        return;
      }

      const budgetToUpdate = { ...freshBudget, status: "DELAYED" };
      const result = await dispatch(
        updateBudgetThunk({
          budgetId: freshBudget.id,
          data: budgetToUpdate,
        }),
      );

      if (viewId !== viewIdRef.current) return;

      if (updateBudgetThunk.fulfilled.match(result)) {
        setSelectedBudgetToView(result.payload);
        dispatch(
          fetchBudgets({
            pageSize,
            pageToFetch: pageIndex + 1,
            filtersQuery: buildFiltersQuery(),
          }),
        );
        setBudgetDetailsFeedback({
          title: "Presupuesto pospuesto",
          description: `El presupuesto ${budgetToUpdate.budgetReference} ha sido marcado como pospuesto`,
          type: "success",
        });
        return;
      }

      setBudgetDetailsFeedback({
        title: "Error al posponer presupuesto",
        description:
          typeof result.payload === "string"
            ? result.payload
            : "No se pudo posponer el presupuesto",
        type: "error",
      });
    } catch (error) {
      if (viewId !== viewIdRef.current) return;
      setBudgetDetailsFeedback({
        title: "Error al posponer presupuesto",
        description:
          error instanceof Error ? error.message : "No se pudo obtener el presupuesto",
        type: "error",
      });
    } finally {
      if (viewId === viewIdRef.current) {
        isPostponingRef.current = false;
        setIsPostponing(false);
      }
    }
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
    isPostponing,
    handleViewBudget,
    handleCloseViewBudgetModal,
    handleRescueBudget,
    handleRejectBudget,
    handleValidateBudget,
    handlePostponeBudget,
    budgetDetailsFeedback,
    clearBudgetDetailsFeedback,
    showBudgetDetailsFeedback,
  };
};
