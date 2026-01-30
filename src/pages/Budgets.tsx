import { type FC, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchBudgets } from "../redux/actions/budgets";
import { clearBudgetsErrors } from "../redux/slices/budgetsSlice";
import { fetchAllBusiness } from "../redux/actions/business";
import { fetchAllTaxesTypes } from "../redux/actions/taxesTypes";
import { fetchAllInvoicesTypes } from "../redux/actions/invoicesTypes";
import { createInvoice, fetchAllInvoices } from "../redux/actions/invoices";
import {
  clearInvoicesErrors,
  resetCreateInvoiceRequest,
} from "../redux/slices/invoicesSlice";
import { Alert } from "../components/shared/Alert";
import { SearchBudgets } from "../components/budgets/SearchBudgets";
import { BudgetsTable } from "../components/budgets/BudgetsTable";
import type { Budget } from "../types/budgets";
import type { Invoice } from "../types/invoices";
import { getInvoiceByBudgetReference } from "../services/invoicesService";
import { PageHeader } from "@/components/shared/PageHeader";
import { useBudgetSearch } from "../hooks/useBudgetSearch";
import { ModalGenerateInvoice } from "../components/budgets/ModalGenerateInvoice";
import { ModalInvoiceData } from "../components/budgets/ModalinvoiceData";

export const Budgets: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { budgets, total, fetchBudgetsRequest } = useAppSelector(
    (state) => state.budgets,
  );
  const { businesses } = useAppSelector((state) => state.business);
  const { taxesTypes } = useAppSelector((state) => state.taxesTypes);
  const { invoicesTypes } = useAppSelector((state) => state.invoicesTypes);
  const { invoices, createInvoiceRequest } = useAppSelector(
    (state) => state.invoices,
  );

  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [selectedInvoicesTypeId, setSelectedInvoicesTypeId] =
    useState<string>("");
  const [selectedTaxesTypeId, setSelectedTaxesTypeId] = useState<string>("");

  // Hook personalizado para la lógica de búsqueda
  const {
    budgetNumber,
    setBudgetNumber,
    clientName,
    setClientName,
    appliedFilters,
    handleSearch,
    handleClearFilters,
    buildFiltersQuery,
  } = useBudgetSearch();

  useEffect(() => {
    Promise.all([
      businesses.length === 0 && dispatch(fetchAllBusiness()),
      taxesTypes.length === 0 && dispatch(fetchAllTaxesTypes()),
      invoicesTypes.length === 0 && dispatch(fetchAllInvoicesTypes()),
      dispatch(fetchAllInvoices(undefined)),
    ]);
  }, [dispatch, businesses.length, taxesTypes.length, invoicesTypes.length]);

  const budgetHasInvoice = useCallback(
    (budgetReference: number): boolean => {
      return invoices.some(
        (invoice) => invoice.budget_reference === budgetReference,
      );
    },
    [invoices],
  );

  useEffect(() => {
    const filtersQuery = buildFiltersQuery();

    dispatch(
      fetchBudgets({
        pageSize,
        pageToFetch: pageIndex + 1,
        filtersQuery,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, appliedFilters]);

  const handleCloseAlert = useCallback(() => {
    dispatch(clearBudgetsErrors());
  }, [dispatch]);

  const handleCloseInvoiceAlert = useCallback(() => {
    dispatch(clearInvoicesErrors());
  }, [dispatch]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBudget(null);
    setSelectedBusinessId("");
    setSelectedInvoicesTypeId("");
    setSelectedTaxesTypeId("");
    dispatch(resetCreateInvoiceRequest());
  }, [dispatch]);

  const handleGenerateInvoice = useCallback(async () => {
    if (
      !selectedBudget ||
      !selectedBusinessId ||
      !selectedInvoicesTypeId ||
      !selectedTaxesTypeId
    ) {
      return;
    }

    const result = await dispatch(
      createInvoice({
        business_id: selectedBusinessId,
        invoices_type_id: selectedInvoicesTypeId,
        taxes_type_id: selectedTaxesTypeId,
        budget_reference: selectedBudget.budgetReference,
        budgetlines: selectedBudget.budgetLines,
        price: selectedBudget.price,
      }),
    );

    if (createInvoice.fulfilled.match(result)) {
      handleCloseModal();
      // Navigate to invoices page
      navigate("/accounting/invoices");
    }
  }, [
    selectedBudget,
    selectedBusinessId,
    selectedInvoicesTypeId,
    selectedTaxesTypeId,
    dispatch,
    handleCloseModal,
    navigate,
  ]);

  const handleViewInvoice = useCallback(async (budget: Budget) => {
    setLoadingInvoice(true);
    try {
      const invoice = await getInvoiceByBudgetReference(budget.budgetReference);
      if (invoice) {
        setSelectedInvoice(invoice);
        setIsViewInvoiceModalOpen(true);
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
    } finally {
      setLoadingInvoice(false);
    }
  }, []);

  const handleCloseViewInvoiceModal = useCallback(() => {
    setIsViewInvoiceModalOpen(false);
    setSelectedInvoice(null);
  }, []);

  const shouldShowError =
    fetchBudgetsRequest.messages &&
    !fetchBudgetsRequest.inProgress &&
    !fetchBudgetsRequest.ok;

  return (
    <>
      {shouldShowError && (
        <Alert
          title="Error al cargar presupuestos"
          description={fetchBudgetsRequest.messages}
          onClose={handleCloseAlert}
        />
      )}

      {createInvoiceRequest.messages && !createInvoiceRequest.inProgress && (
        <Alert
          title={
            createInvoiceRequest.ok
              ? "Factura generada"
              : "Error al generar factura"
          }
          description={createInvoiceRequest.messages}
          onClose={handleCloseInvoiceAlert}
        />
      )}

      <ModalGenerateInvoice
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onGenerate={handleGenerateInvoice}
        selectedBudget={selectedBudget}
        businesses={businesses}
        invoicesTypes={invoicesTypes}
        taxesTypes={taxesTypes}
        selectedBusinessId={selectedBusinessId}
        setSelectedBusinessId={setSelectedBusinessId}
        selectedInvoicesTypeId={selectedInvoicesTypeId}
        setSelectedInvoicesTypeId={setSelectedInvoicesTypeId}
        selectedTaxesTypeId={selectedTaxesTypeId}
        setSelectedTaxesTypeId={setSelectedTaxesTypeId}
        isGenerating={createInvoiceRequest.inProgress}
      />

      <ModalInvoiceData
        isOpen={isViewInvoiceModalOpen}
        onClose={handleCloseViewInvoiceModal}
        invoice={selectedInvoice}
      />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Presupuestos"
          description="Gestiona tus presupuestos"
        />

        {/* Buscador */}
        <SearchBudgets
          budgetNumber={budgetNumber}
          setBudgetNumber={setBudgetNumber}
          clientName={clientName}
          setClientName={setClientName}
          onSearch={() => {
            handleSearch();
            setPageIndex(0);
          }}
          onClearFilters={() => {
            handleClearFilters();
            setPageIndex(0);
          }}
          appliedFilters={appliedFilters}
          isLoading={fetchBudgetsRequest.inProgress}
        />

        <BudgetsTable
          budgets={budgets}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          isLoading={fetchBudgetsRequest.inProgress}
          loadingInvoice={loadingInvoice}
          budgetHasInvoice={budgetHasInvoice}
          onPageChange={setPageIndex}
          onGenerateInvoice={(budget) => {
            setSelectedBudget(budget);
            setIsModalOpen(true);
          }}
          onViewInvoice={handleViewInvoice}
        />
      </div>
    </>
  );
};
