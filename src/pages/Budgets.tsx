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
import { getInvoicesByBudgetReference } from "../services/invoicesService";
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
  const [selectedInvoices, setSelectedInvoices] = useState<Invoice[]>([]);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [selectedInvoicesTypeId, setSelectedInvoicesTypeId] =
    useState<string>("");
  const [selectedTaxesTypeId, setSelectedTaxesTypeId] = useState<string>("");
  const [invoiceTo, setInvoiceTo] = useState<"titular" | "empresa">("titular");
  const [additionalData, setAdditionalData] = useState<string>("");

  const {
    budgetNumber,
    setBudgetNumber,
    clientName,
    setClientName,
    phone,
    setPhone,
    status,
    setStatus,
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
    setInvoiceTo("titular");
    setAdditionalData("");
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

    // Extract client data from budget
    const clientData =
      invoiceTo === "empresa" && selectedBudget.user?.company
        ? {
            client_name: selectedBudget.user.company.name,
            client_nif: selectedBudget.user.company.nif,
            client_email: selectedBudget.user?.email || "",
            client_address: selectedBudget.user.company.address,
            client_locality: selectedBudget.user.company.locality,
            client_postal_code: selectedBudget.user.company.zipCode,
            client_phone:
              selectedBudget.user?.phone || selectedBudget.phone || "",
          }
        : {
            client_name:
              selectedBudget.user?.FullName ||
              `${selectedBudget.user?.firstName || ""} ${selectedBudget.user?.lastName || ""}`.trim() ||
              selectedBudget.client ||
              "",
            client_nif: selectedBudget.user?.dnif || "",
            client_email: selectedBudget.user?.email || "",
            client_address:
              selectedBudget.user?.address || selectedBudget.address || "",
            client_locality:
              selectedBudget.user?.locality || selectedBudget.locality || "",
            client_postal_code: selectedBudget.user?.zipCode || "",
            client_phone:
              selectedBudget.user?.phone || selectedBudget.phone || "",
          };

    // Apply invoice type percentage and recalculate IVA
    const invoiceType = invoicesTypes.find(
      (t) => t.id === selectedInvoicesTypeId,
    );
    const taxType = taxesTypes.find((t) => t.id === selectedTaxesTypeId);
    const factor = (invoiceType?.percentage ?? 100) / 100;
    const taxRate = taxType?.tax ?? 0;
    const round = (n: number) => Math.round(n * 100) / 100;

    const originalPrice = selectedBudget.price;
    const adjSubTotal = round(originalPrice.subTotal * factor);
    const adjExtras = round(originalPrice.extras * factor);
    const adjCostSend = round(originalPrice.costSend * factor);
    const adjUserDiscount = round(originalPrice.userDiscount * factor);
    const vatBase = adjSubTotal + adjExtras + adjCostSend - adjUserDiscount;
    const adjVat = round(vatBase * (taxRate / 100));

    const adjustedPrice = {
      ...originalPrice,
      subTotal: adjSubTotal,
      extras: adjExtras,
      subTotalWithExtras: round(originalPrice.subTotalWithExtras * factor),
      costSend: adjCostSend,
      userDiscount: adjUserDiscount,
      packs: round(originalPrice.packs * factor),
      vat: adjVat,
      total: round(vatBase + adjVat),
    };

    const adjustedBudgetLines = selectedBudget.budgetLines.map((line) => ({
      ...line,
      precioUd: round(line.precioUd * factor),
      totalPrice: round(line.totalPrice * factor),
      costetotal: round(line.costetotal * factor),
    }));

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
    invoicesTypes,
    taxesTypes,
    invoiceTo,
    additionalData,
    dispatch,
    handleCloseModal,
    navigate,
  ]);

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
        invoiceTo={invoiceTo}
        setInvoiceTo={setInvoiceTo}
        additionalData={additionalData}
        setAdditionalData={setAdditionalData}
        isGenerating={createInvoiceRequest.inProgress}
      />

      <ModalInvoiceData
        isOpen={isViewInvoiceModalOpen}
        onClose={handleCloseViewInvoiceModal}
        invoices={selectedInvoices}
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
          phone={phone}
          setPhone={setPhone}
          status={status}
          setStatus={setStatus}
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
            const defaultBusiness = businesses.find((b) => b.is_default);
            if (defaultBusiness) {
              setSelectedBusinessId(defaultBusiness.id);
            }
            setIsModalOpen(true);
          }}
          onViewInvoice={handleViewInvoice}
        />
      </div>
    </>
  );
};
