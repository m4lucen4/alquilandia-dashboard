import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchBudgets } from "../redux/actions/budgets";
import {
  clearBudgetsErrors,
  clearRejectBudgetErrors,
} from "../redux/slices/budgetsSlice";
import { resetWizard } from "../redux/slices/budgetWizardSlice";
import { fetchAllBusiness } from "../redux/actions/business";
import { fetchAllTaxesTypes } from "../redux/actions/taxesTypes";
import { fetchAllInvoicesTypes } from "../redux/actions/invoicesTypes";
import { fetchAllInvoices } from "../redux/actions/invoices";
import { getAdminAndTechniciansThunk } from "../redux/actions/users";
import { clearInvoicesErrors } from "../redux/slices/invoicesSlice";
import { Alert } from "../components/shared/Alert";
import { SearchBudgets } from "../components/budgets/SearchBudgets";
import { BudgetsTable } from "../components/budgets/BudgetsTable";
import type { Budget, BudgetHistoryEntry } from "../types/budgets";
import type { Invoice } from "../types/invoices";
import { getInvoicesByBudgetReference } from "../services/invoicesService";
import { getBudgetDetailsByRecordId } from "../services/budgetsServices";
import { PageHeader } from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import { useBudgetSearch } from "../hooks/useBudgetSearch";
import { useInvoiceGeneration } from "../hooks/useInvoiceGeneration";
import { useBudgetPdfGeneration } from "../hooks/useBudgetPdfGeneration";
import { useBreakageInvoice } from "../hooks/useBreakageInvoice";
import { useBudgetDetails } from "../hooks/useBudgetDetails";
import { ModalGenerateInvoice } from "../components/budgets/ModalGenerateInvoice";
import { ModalGenerateBudgetPdf } from "../components/budgets/ModalGenerateBudgetPdf";
import { ModalInvoiceData } from "../components/budgets/ModalinvoiceData";
import { ModalBudgetData } from "../components/budgets/ModalBudgetData";
import { ModalGenerateBreakageInvoice } from "../components/budgets/ModalGenerateBreakageInvoice";
import { BudgetLocationMapPanel } from "../components/budgets/BudgetLocationMapPanel";
import { ModalBudgetHistory } from "../components/budgets/ModalBudgetHistory";

export const Budgets: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { budgets, total, fetchBudgetsRequest, rejectBudgetRequest, updateBudgetRequest } =
    useAppSelector((state) => state.budgets);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { businesses } = useAppSelector((state) => state.business);
  const { taxesTypes } = useAppSelector((state) => state.taxesTypes);
  const { invoicesTypes } = useAppSelector((state) => state.invoicesTypes);
  const { invoices, createInvoiceRequest } = useAppSelector(
    (state) => state.invoices,
  );
  const { technicians, getAdminAndTechniciansRequest } = useAppSelector(
    (state) => state.users,
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<Invoice[]>([]);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [isBudgetHistoryModalOpen, setIsBudgetHistoryModalOpen] = useState(false);
  const [budgetHistoryEntries, setBudgetHistoryEntries] = useState<
    BudgetHistoryEntry[] | null
  >(null);
  const [isBudgetHistoryLoading, setIsBudgetHistoryLoading] = useState(false);
  const [budgetHistoryError, setBudgetHistoryError] = useState<string | null>(null);
  const [budgetHistoryId, setBudgetHistoryId] = useState(0);
  const historyRequestIdRef = useRef(0);
  const [viewMode, setViewMode] = useState<"table" | "map">("table");

  const {
    budgetNumber,
    setBudgetNumber,
    clientName,
    setClientName,
    phone,
    setPhone,
    status,
    setStatus,
    address,
    setAddress,
    eventDateFrom,
    setEventDateFrom,
    eventDateTo,
    setEventDateTo,
    creationDateFrom,
    setCreationDateFrom,
    creationDateTo,
    setCreationDateTo,
    appliedFilters,
    handleSearch,
    handleClearFilters,
    buildFiltersQuery,
  } = useBudgetSearch();

  const invoiceGeneration = useInvoiceGeneration({
    businesses,
    invoicesTypes,
    taxesTypes,
  });
  const budgetPdfGeneration = useBudgetPdfGeneration({ businesses });
  const breakageInvoice = useBreakageInvoice({
    businesses,
    invoicesTypes,
    taxesTypes,
  });
  const budgetDetails = useBudgetDetails({
    pageIndex,
    pageSize,
    buildFiltersQuery,
  });

  useEffect(() => {
    Promise.all([
      businesses.length === 0 && dispatch(fetchAllBusiness()),
      taxesTypes.length === 0 && dispatch(fetchAllTaxesTypes()),
      invoicesTypes.length === 0 && dispatch(fetchAllInvoicesTypes()),
      dispatch(fetchAllInvoices(undefined)),
    ]);
  }, [dispatch, businesses.length, taxesTypes.length, invoicesTypes.length]);

  useEffect(() => {
    if (
      technicians.length === 0 &&
      !getAdminAndTechniciansRequest.inProgress &&
      !getAdminAndTechniciansRequest.messages &&
      !getAdminAndTechniciansRequest.ok
    ) {
      dispatch(getAdminAndTechniciansThunk());
    }
  }, [dispatch, getAdminAndTechniciansRequest.inProgress, getAdminAndTechniciansRequest.messages, getAdminAndTechniciansRequest.ok, technicians.length]);

  const budgetHasInvoice = useCallback(
    (budgetReference: number): boolean =>
      invoices.some((invoice) => invoice.budget_reference === budgetReference),
    [invoices],
  );

  useEffect(() => {
    dispatch(
      fetchBudgets({
        pageSize,
        pageToFetch: pageIndex + 1,
        filtersQuery: buildFiltersQuery(),
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, appliedFilters]);

  const handleCloseAlert = useCallback(() => {
    dispatch(clearBudgetsErrors());
  }, [dispatch]);

  const handleCloseInvoiceAlert = useCallback(() => {
    dispatch(clearInvoicesErrors());
  }, [dispatch]);

  const handleCloseRejectAlert = useCallback(() => {
    dispatch(clearRejectBudgetErrors());
  }, [dispatch]);

  const handleViewInvoice = useCallback(async (budget: Budget) => {
    setLoadingInvoice(true);
    try {
      const invoices = await getInvoicesByBudgetReference(budget.budgetReference);
      if (invoices && invoices.length > 0) {
        setSelectedInvoices(invoices);
        setIsViewInvoiceModalOpen(true);
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoadingInvoice(false);
    }
  }, []);

  const handleCloseViewInvoiceModal = useCallback(() => {
    setIsViewInvoiceModalOpen(false);
    setSelectedInvoices([]);
  }, []);

  const handleViewHistory = useCallback(async (budget: Budget) => {
    const requestId = historyRequestIdRef.current + 1;
    historyRequestIdRef.current = requestId;
    setBudgetHistoryId(requestId);
    setIsBudgetHistoryModalOpen(true);
    setBudgetHistoryEntries(null);
    setBudgetHistoryError(null);
    setIsBudgetHistoryLoading(true);

    try {
      const budgetDetails = await getBudgetDetailsByRecordId(budget.id);
      if (requestId !== historyRequestIdRef.current) return;

      if (budgetDetails.id !== budget.id) {
        setBudgetHistoryError(
          "El detalle obtenido no corresponde al presupuesto seleccionado",
        );
        return;
      }

      setBudgetHistoryEntries(budgetDetails.history ?? []);
    } catch (error) {
      if (requestId !== historyRequestIdRef.current) return;
      setBudgetHistoryError(
        error instanceof Error ? error.message : "No se pudo cargar el historial",
      );
    } finally {
      if (requestId === historyRequestIdRef.current) {
        setIsBudgetHistoryLoading(false);
      }
    }
  }, []);

  const handleCloseBudgetHistoryModal = useCallback(() => {
    historyRequestIdRef.current += 1;
    setIsBudgetHistoryModalOpen(false);
    setBudgetHistoryEntries(null);
    setBudgetHistoryError(null);
    setIsBudgetHistoryLoading(false);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
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

      {rejectBudgetRequest.messages && !rejectBudgetRequest.inProgress && (
        <Alert
          title={
            rejectBudgetRequest.ok
              ? "Presupuesto rechazado"
              : "Error al rechazar presupuesto"
          }
          description={rejectBudgetRequest.messages}
          onClose={handleCloseRejectAlert}
        />
      )}

      <ModalGenerateBudgetPdf
        isOpen={budgetPdfGeneration.isBudgetPdfModalOpen}
        onClose={budgetPdfGeneration.handleCloseBudgetPdfModal}
        onGenerate={budgetPdfGeneration.handleGenerateBudgetPdf}
        selectedBudget={budgetPdfGeneration.selectedBudgetForPdf}
        businesses={businesses}
        selectedBusinessId={budgetPdfGeneration.pdfBusinessId}
        setSelectedBusinessId={budgetPdfGeneration.setPdfBusinessId}
        invoiceTo={budgetPdfGeneration.pdfInvoiceTo}
        setInvoiceTo={budgetPdfGeneration.setPdfInvoiceTo}
        date={budgetPdfGeneration.pdfDate}
        setDate={budgetPdfGeneration.setPdfDate}
        includeVAT={budgetPdfGeneration.pdfIncludeVAT}
        setIncludeVAT={budgetPdfGeneration.setPdfIncludeVAT}
        isGenerating={budgetPdfGeneration.isGeneratingPdf}
      />

      <ModalGenerateInvoice
        isOpen={invoiceGeneration.isModalOpen}
        onClose={invoiceGeneration.handleCloseModal}
        onGenerate={invoiceGeneration.handleGenerateInvoice}
        selectedBudget={invoiceGeneration.selectedBudget}
        businesses={businesses}
        invoicesTypes={invoicesTypes}
        taxesTypes={taxesTypes}
        selectedBusinessId={invoiceGeneration.selectedBusinessId}
        setSelectedBusinessId={invoiceGeneration.setSelectedBusinessId}
        selectedInvoicesTypeId={invoiceGeneration.selectedInvoicesTypeId}
        setSelectedInvoicesTypeId={invoiceGeneration.setSelectedInvoicesTypeId}
        selectedTaxesTypeId={invoiceGeneration.selectedTaxesTypeId}
        setSelectedTaxesTypeId={invoiceGeneration.setSelectedTaxesTypeId}
        invoiceTo={invoiceGeneration.invoiceTo}
        setInvoiceTo={invoiceGeneration.setInvoiceTo}
        additionalData={invoiceGeneration.additionalData}
        setAdditionalData={invoiceGeneration.setAdditionalData}
        createdAt={invoiceGeneration.createdAt}
        setCreatedAt={invoiceGeneration.setCreatedAt}
        isGenerating={createInvoiceRequest.inProgress}
      />

      <ModalInvoiceData
        isOpen={isViewInvoiceModalOpen}
        onClose={handleCloseViewInvoiceModal}
        invoices={selectedInvoices}
      />

      <ModalBudgetHistory
        isOpen={isBudgetHistoryModalOpen}
        historyId={budgetHistoryId}
        onClose={handleCloseBudgetHistoryModal}
        entries={budgetHistoryEntries}
        technicians={technicians}
        isLoading={isBudgetHistoryLoading}
        error={budgetHistoryError}
      />

      <ModalBudgetData
        isOpen={budgetDetails.isViewBudgetModalOpen}
        onClose={budgetDetails.handleCloseViewBudgetModal}
        budget={budgetDetails.selectedBudgetToView}
        user={budgetDetails.selectedUserToView}
        onRescue={budgetDetails.handleRescueBudget}
        onReject={budgetDetails.handleRejectBudget}
        isRejecting={rejectBudgetRequest.inProgress}
        currentUser={currentUser}
        onValidate={budgetDetails.handleValidateBudget}
        isValidating={updateBudgetRequest.inProgress}
        onPostpone={budgetDetails.handlePostponeBudget}
        isPostponing={budgetDetails.isPostponing}
        feedback={budgetDetails.budgetDetailsFeedback}
      />

      <ModalGenerateBreakageInvoice
        isOpen={breakageInvoice.isBreakageModalOpen}
        onClose={breakageInvoice.handleCloseBreakageModal}
        budget={breakageInvoice.selectedBudgetForBreakage}
        businesses={businesses}
        taxesTypes={taxesTypes}
        breakageInvoiceType={breakageInvoice.breakageInvoiceType}
        isGeneratingInvoice={createInvoiceRequest.inProgress}
        isReducingInventory={breakageInvoice.isReducingInventory}
        isDownloadingAnnex={breakageInvoice.isDownloadingAnnex}
        reduceInventoryResult={breakageInvoice.reduceInventoryResult}
        onDismissReduceInventoryResult={() =>
          breakageInvoice.setReduceInventoryResult(null)
        }
        onGenerateInvoice={breakageInvoice.handleGenerateBreakageInvoice}
        onReduceInventory={breakageInvoice.handleReduceInventoryForBreakage}
        onDownloadAnnex={breakageInvoice.handleDownloadBreakageAnnex}
      />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between">
          <PageHeader
            title="Presupuestos"
            description="Gestiona tus presupuestos"
          />
          <div className="flex gap-2">
            <Button
              title={viewMode === "table" ? "Ver mapa" : "Ver tabla"}
              onClick={() =>
                setViewMode((currentMode) =>
                  currentMode === "table" ? "map" : "table",
                )
              }
              variant="secondary"
            />
            <Button
              title="Nuevo presupuesto"
              onClick={() => {
                dispatch(resetWizard());
                navigate("/budgets/new");
              }}
              variant="primary"
            />
          </div>
        </div>

        {viewMode === "map" ? (
          <BudgetLocationMapPanel onBudgetSelect={budgetDetails.handleViewBudget} />
        ) : (
          <>
            <SearchBudgets
              budgetNumber={budgetNumber}
              setBudgetNumber={setBudgetNumber}
              clientName={clientName}
              setClientName={setClientName}
              phone={phone}
              setPhone={setPhone}
              status={status}
              setStatus={setStatus}
              address={address}
              setAddress={setAddress}
              eventDateFrom={eventDateFrom}
              setEventDateFrom={setEventDateFrom}
              eventDateTo={eventDateTo}
              setEventDateTo={setEventDateTo}
              creationDateFrom={creationDateFrom}
              setCreationDateFrom={setCreationDateFrom}
              creationDateTo={creationDateTo}
              setCreationDateTo={setCreationDateTo}
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
              loadingBudget={budgetDetails.loadingBudget}
              budgetHasInvoice={budgetHasInvoice}
              onPageChange={setPageIndex}
              onPageSizeChange={handlePageSizeChange}
              onGenerateInvoice={invoiceGeneration.handleOpenModal}
              onViewInvoice={handleViewInvoice}
              onViewBudget={budgetDetails.handleViewBudget}
              onViewHistory={handleViewHistory}
              onGenerateBudgetPdf={budgetPdfGeneration.handleOpenBudgetPdfModal}
              onGenerateBreakageInvoice={breakageInvoice.handleOpenBreakageModal}
            />
          </>
        )}
      </div>
    </>
  );
};
