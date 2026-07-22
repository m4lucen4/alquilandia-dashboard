import { type FC, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchBudgets, rejectBudgetThunk } from "../redux/actions/budgets";
import {
  clearBudgetsErrors,
  clearRejectBudgetErrors,
} from "../redux/slices/budgetsSlice";
import { resetWizard, rescueBudget } from "../redux/slices/budgetWizardSlice";
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
import type { Budget, User } from "../types/budgets";
import type { Invoice } from "../types/invoices";
import { getInvoicesByBudgetReference } from "../services/invoicesService";
import { getBudgetById } from "../services/budgetsServices";
import { PageHeader } from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import { useBudgetSearch } from "../hooks/useBudgetSearch";
import {
  getClientDataFromUser,
  calculateAdjustedPrice,
  adjustBudgetLines,
} from "../helpers/budgets";
import { fetchUserDetails } from "../redux/actions/users";
import { generateBudgetPDF, generateProformaPDF } from "../services/pdfService";
import { ModalGenerateInvoice } from "../components/budgets/ModalGenerateInvoice";
import { ModalGenerateBudgetPdf } from "../components/budgets/ModalGenerateBudgetPdf";
import { ModalInvoiceData } from "../components/budgets/ModalinvoiceData";
import { ModalBudgetData } from "../components/budgets/ModalBudgetData";

export const Budgets: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { budgets, total, fetchBudgetsRequest, rejectBudgetRequest } =
    useAppSelector((state) => state.budgets);
  const { businesses } = useAppSelector((state) => state.business);
  const { taxesTypes } = useAppSelector((state) => state.taxesTypes);
  const { invoicesTypes } = useAppSelector((state) => state.invoicesTypes);
  const { invoices, createInvoiceRequest } = useAppSelector(
    (state) => state.invoices,
  );

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false);
  const [isViewBudgetModalOpen, setIsViewBudgetModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedBudgetToView, setSelectedBudgetToView] =
    useState<Budget | null>(null);
  const [selectedUserToView, setSelectedUserToView] = useState<User | null>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<Invoice[]>([]);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [selectedInvoicesTypeId, setSelectedInvoicesTypeId] =
    useState<string>("");
  const [selectedTaxesTypeId, setSelectedTaxesTypeId] = useState<string>("");
  const [invoiceTo, setInvoiceTo] = useState<"titular" | "empresa">("titular");
  const [additionalData, setAdditionalData] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");

  // Generate budget PDF modal states
  const [isBudgetPdfModalOpen, setIsBudgetPdfModalOpen] = useState(false);
  const [selectedBudgetForPdf, setSelectedBudgetForPdf] =
    useState<Budget | null>(null);
  const [pdfBusinessId, setPdfBusinessId] = useState<string>("");
  const [pdfInvoiceTo, setPdfInvoiceTo] = useState<"titular" | "empresa">(
    "titular",
  );
  const [pdfDate, setPdfDate] = useState<string>("");
  const [pdfIncludeVAT, setPdfIncludeVAT] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

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
  }, [pageIndex, pageSize, appliedFilters]);

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
    setInvoiceTo("titular");
    setAdditionalData("");
    setCreatedAt("");
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

    // Extract client data from fresh user fetch
    const freshUser = await dispatch(
      fetchUserDetails(selectedBudget.user.id),
    ).unwrap();
    const clientData = getClientDataFromUser(freshUser, invoiceTo);

    // Proforma flow — generate and download directly, no DB save
    if (selectedInvoicesTypeId === "proforma-25" || selectedInvoicesTypeId === "proforma-100") {
      const factor = selectedInvoicesTypeId === "proforma-25" ? 0.25 : 1;
      const taxType = taxesTypes.find((t) => t.id === selectedTaxesTypeId);
      const taxRate = taxType?.tax ?? 0;
      const business = businesses.find((b) => b.id === selectedBusinessId);
      if (!business) return;

      const proformaClientData = clientData;

      const blob = await generateProformaPDF(
        selectedBudget,
        business,
        proformaClientData,
        factor,
        taxRate,
        createdAt || new Date().toISOString().slice(0, 10),
        selectedInvoicesTypeId === "proforma-100",
        additionalData || undefined,
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proforma_${selectedBudget.budgetReference}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      handleCloseModal();
      return;
    }

    // Apply invoice type percentage and recalculate IVA
    const invoiceType = invoicesTypes.find(
      (t) => t.id === selectedInvoicesTypeId,
    );
    const taxType = taxesTypes.find((t) => t.id === selectedTaxesTypeId);
    const factor = (invoiceType?.percentage ?? 100) / 100;
    const taxRate = taxType?.tax ?? 0;

    const adjustedPrice = calculateAdjustedPrice(
      selectedBudget.price,
      factor,
      taxRate,
      selectedBudget.totalCouponDiscount || 0,
    );
    const adjustedBudgetLines = adjustBudgetLines(
      selectedBudget.budgetLines,
      factor,
    );

    const result = await dispatch(
      createInvoice({
        business_id: selectedBusinessId,
        invoices_type_id: selectedInvoicesTypeId,
        taxes_type_id: selectedTaxesTypeId,
        budget_reference: selectedBudget.budgetReference,
        budgetlines: adjustedBudgetLines,
        price: adjustedPrice,
        ...clientData,
        additional_data: additionalData || undefined,
        coupon_discount: selectedBudget.totalCouponDiscount || 0,
        event_date: selectedBudget.eventDate,
        created_at: createdAt
          ? new Date(createdAt).toISOString()
          : new Date().toISOString(),
      }),
    );

    if (createInvoice.fulfilled.match(result)) {
      handleCloseModal();
      // Navigate to invoices page
      navigate("/accounting/invoices");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedBudget,
    selectedBusinessId,
    selectedInvoicesTypeId,
    selectedTaxesTypeId,
    invoicesTypes,
    taxesTypes,
    invoiceTo,
    additionalData,
    createdAt,
    dispatch,
    handleCloseModal,
    navigate,
  ]);

  const handleOpenBudgetPdfModal = useCallback(
    (budget: Budget) => {
      setSelectedBudgetForPdf(budget);
      const defaultBusiness = businesses.find((b) => b.is_default);
      if (defaultBusiness) {
        setPdfBusinessId(defaultBusiness.id);
      }
      setPdfDate(new Date().toISOString().split("T")[0]);
      setPdfIncludeVAT(true);
      setIsBudgetPdfModalOpen(true);
    },
    [businesses],
  );

  const handleCloseBudgetPdfModal = useCallback(() => {
    setIsBudgetPdfModalOpen(false);
    setSelectedBudgetForPdf(null);
    setPdfBusinessId("");
    setPdfInvoiceTo("titular");
    setPdfDate("");
    setPdfIncludeVAT(true);
  }, []);

  const handleGenerateBudgetPdf = useCallback(async () => {
    if (!selectedBudgetForPdf || !pdfBusinessId || !pdfDate) return;

    const business = businesses.find((b) => b.id === pdfBusinessId);
    if (!business) return;

    setIsGeneratingPdf(true);
    try {
      const freshUser = await dispatch(
        fetchUserDetails(selectedBudgetForPdf.user.id),
      ).unwrap();
      const clientData = getClientDataFromUser(freshUser, pdfInvoiceTo);

      const pdfBlob = await generateBudgetPDF(
        selectedBudgetForPdf,
        business,
        clientData,
        pdfIncludeVAT,
        pdfDate,
      );

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      const safeClient = clientData.client_name
        .replaceAll(/[/\\:*?"<>|]/g, "")
        .replaceAll(/\s+/g, "_");
      link.download = `${safeClient}_${selectedBudgetForPdf.budgetReference}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      handleCloseBudgetPdfModal();
    } catch (error) {
      console.error("Error generating budget PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [
    selectedBudgetForPdf,
    pdfBusinessId,
    pdfDate,
    pdfInvoiceTo,
    pdfIncludeVAT,
    businesses,
    dispatch,
    handleCloseBudgetPdfModal,
  ]);

  const handleViewBudget = useCallback(async (budget: Budget) => {
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
  }, [dispatch]);

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
      dispatch(rescueBudget({
        ...budgetFromList,
        price: { ...budgetFromList.price, withIVA },
      }));
    } catch {
      dispatch(rescueBudget(budgetFromList));
    }
    navigate("/budgets/new");
  }, [selectedBudgetToView, handleCloseViewBudgetModal, dispatch, navigate]);

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
    selectedBudgetToView,
    dispatch,
    handleCloseViewBudgetModal,
    pageSize,
    pageIndex,
    buildFiltersQuery,
  ]);

  const handleCloseRejectAlert = useCallback(() => {
    dispatch(clearRejectBudgetErrors());
  }, [dispatch]);

  const handleViewInvoice = useCallback(async (budget: Budget) => {
    setLoadingInvoice(true);
    try {
      const invoices = await getInvoicesByBudgetReference(
        budget.budgetReference,
      );
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
        isOpen={isBudgetPdfModalOpen}
        onClose={handleCloseBudgetPdfModal}
        onGenerate={handleGenerateBudgetPdf}
        selectedBudget={selectedBudgetForPdf}
        businesses={businesses}
        selectedBusinessId={pdfBusinessId}
        setSelectedBusinessId={setPdfBusinessId}
        invoiceTo={pdfInvoiceTo}
        setInvoiceTo={setPdfInvoiceTo}
        date={pdfDate}
        setDate={setPdfDate}
        includeVAT={pdfIncludeVAT}
        setIncludeVAT={setPdfIncludeVAT}
        isGenerating={isGeneratingPdf}
      />

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
        invoiceTo={invoiceTo}
        setInvoiceTo={setInvoiceTo}
        additionalData={additionalData}
        setAdditionalData={setAdditionalData}
        createdAt={createdAt}
        setCreatedAt={setCreatedAt}
        isGenerating={createInvoiceRequest.inProgress}
      />

      <ModalInvoiceData
        isOpen={isViewInvoiceModalOpen}
        onClose={handleCloseViewInvoiceModal}
        invoices={selectedInvoices}
      />

      <ModalBudgetData
        isOpen={isViewBudgetModalOpen}
        onClose={handleCloseViewBudgetModal}
        budget={selectedBudgetToView}
        user={selectedUserToView}
        onRescue={handleRescueBudget}
        onReject={handleRejectBudget}
        isRejecting={rejectBudgetRequest.inProgress}
      />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between">
          <PageHeader
            title="Presupuestos"
            description="Gestiona tus presupuestos"
          />
          <Button
            title="Nuevo presupuesto"
            onClick={() => { dispatch(resetWizard()); navigate("/budgets/new"); }}
            variant="primary"
          />
        </div>

        {/* Buscador */}
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
          loadingBudget={loadingBudget}
          budgetHasInvoice={budgetHasInvoice}
          onPageChange={setPageIndex}
          onPageSizeChange={handlePageSizeChange}
          onGenerateInvoice={(budget) => {
            setSelectedBudget(budget);
            const defaultBusiness = businesses.find((b) => b.is_default);
            if (defaultBusiness) {
              setSelectedBusinessId(defaultBusiness.id);
            }
            // Set today's date as default
            const today = new Date().toISOString().split("T")[0];
            setCreatedAt(today);
            setIsModalOpen(true);
          }}
          onViewInvoice={handleViewInvoice}
          onViewBudget={handleViewBudget}
          onGenerateBudgetPdf={handleOpenBudgetPdfModal}
        />
      </div>
    </>
  );
};
