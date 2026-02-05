import { type FC, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAllInvoices,
  createCorrectiveInvoice,
} from "@/redux/actions/invoices";
import {
  clearInvoicesErrors,
  resetCreateCorrectiveInvoiceRequest,
} from "@/redux/slices/invoicesSlice";
import { PageHeader } from "@/components/shared/PageHeader";
import { ModalCreateCorrectiveInvoice } from "@/components/invoices/ModalCreateCorrectiveInvoice";
import { AlertInvoices } from "@/components/invoices/AlertInvoices";
import { SearchInvoices } from "@/components/invoices/SearchInvoices";
import { InvoicesTable } from "@/components/invoices/InvoicesTable";
import { useInvoiceSearch } from "@/hooks/useInvoiceSearch";
import type { Invoice } from "@/types/invoices";

export const Invoices: FC = () => {
  const dispatch = useAppDispatch();
  const { invoices, fetchInvoicesRequest, createCorrectiveInvoiceRequest } =
    useAppSelector((state) => state.invoices);

  const {
    selectedBusinessId,
    budgetNumber,
    appliedFilters,
    businesses,
    isLoading,
    handleSearch,
    handleClearFilters,
    handleBusinessChange,
    handleBudgetNumberChange,
  } = useInvoiceSearch();

  // Corrective invoice modal states
  const [isCorrectiveModalOpen, setIsCorrectiveModalOpen] = useState(false);
  const [selectedInvoiceForCorrective, setSelectedInvoiceForCorrective] =
    useState<Invoice | null>(null);

  const handleCloseAlert = () => {
    dispatch(clearInvoicesErrors());
  };

  const handleOpenCorrectiveModal = useCallback((invoice: Invoice) => {
    setSelectedInvoiceForCorrective(invoice);
    setIsCorrectiveModalOpen(true);
  }, []);

  const handleCloseCorrectiveModal = useCallback(() => {
    setIsCorrectiveModalOpen(false);
    setSelectedInvoiceForCorrective(null);
    dispatch(resetCreateCorrectiveInvoiceRequest());
  }, [dispatch]);

  const handleCreateCorrective = useCallback(
    async (reason: string) => {
      if (!selectedInvoiceForCorrective) return;

      const result = await dispatch(
        createCorrectiveInvoice({
          original_invoice_id: selectedInvoiceForCorrective.id,
          corrective_reason: reason,
        }),
      );

      if (createCorrectiveInvoice.fulfilled.match(result)) {
        handleCloseCorrectiveModal();
        // Refresh invoices list
        dispatch(
          fetchAllInvoices({
            businessId: appliedFilters.businessId || undefined,
            budgetReference: appliedFilters.budgetNumber || undefined,
          }),
        );
      }
    },
    [
      selectedInvoiceForCorrective,
      dispatch,
      appliedFilters,
      handleCloseCorrectiveModal,
    ],
  );

  return (
    <>
      <AlertInvoices
        fetchInvoicesRequest={fetchInvoicesRequest}
        createCorrectiveInvoiceRequest={createCorrectiveInvoiceRequest}
        onClose={handleCloseAlert}
      />

      <ModalCreateCorrectiveInvoice
        isOpen={isCorrectiveModalOpen}
        onClose={handleCloseCorrectiveModal}
        onConfirm={handleCreateCorrective}
        invoice={selectedInvoiceForCorrective}
        isCreating={createCorrectiveInvoiceRequest.inProgress}
      />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Facturas" description="Gestiona tus facturas" />

        {/* Filtros */}
        <SearchInvoices
          selectedBusinessId={selectedBusinessId}
          budgetNumber={budgetNumber}
          appliedFilters={appliedFilters}
          businesses={businesses}
          isLoading={isLoading}
          onBusinessChange={handleBusinessChange}
          onBudgetNumberChange={handleBudgetNumberChange}
          onSearch={handleSearch}
          onClearFilters={handleClearFilters}
        />

        {/* Tabla de facturas */}
        <InvoicesTable
          invoices={invoices}
          isLoading={fetchInvoicesRequest.inProgress}
          onOpenCorrectiveModal={handleOpenCorrectiveModal}
        />
      </div>
    </>
  );
};

export default Invoices;
