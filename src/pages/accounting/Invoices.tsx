import { type FC, useState, useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAllInvoices,
  createCorrectiveInvoice,
  updateInvoice,
} from "@/redux/actions/invoices";
import {
  clearInvoicesErrors,
  resetCreateCorrectiveInvoiceRequest,
  resetUpdateInvoiceRequest,
} from "@/redux/slices/invoicesSlice";
import { fetchAllInvoicesTypes } from "@/redux/actions/invoicesTypes";
import { fetchAllTaxesTypes } from "@/redux/actions/taxesTypes";
import { fetchUserDetails } from "@/redux/actions/users";
import { PageHeader } from "@/components/shared/PageHeader";
import { ModalCreateCorrectiveInvoice } from "@/components/invoices/ModalCreateCorrectiveInvoice";
import { ModalEditInvoice } from "@/components/invoices/ModalEditInvoice";
import { AlertInvoices } from "@/components/invoices/AlertInvoices";
import { SearchInvoices } from "@/components/invoices/SearchInvoices";
import { InvoicesTable } from "@/components/invoices/InvoicesTable";
import { useInvoiceSearch } from "@/hooks/useInvoiceSearch";
import { getRectifiedInvoiceIds } from "@/services/invoicesService";
import { getBudgetByReference } from "@/services/budgetsServices";
import { getClientDataFromUser } from "@/helpers/budgets";
import type { Invoice } from "@/types/invoices";
import type { User } from "@/types/budgets";

export const Invoices: FC = () => {
  const dispatch = useAppDispatch();
  const {
    invoices,
    total,
    fetchInvoicesRequest,
    createCorrectiveInvoiceRequest,
    updateInvoiceRequest,
  } = useAppSelector((state) => state.invoices);

  const { invoicesTypes } = useAppSelector((state) => state.invoicesTypes);
  const { taxesTypes } = useAppSelector((state) => state.taxesTypes);

  const {
    selectedBusinessId,
    budgetNumber,
    invoiceNumber,
    clientName,
    appliedFilters,
    businesses,
    isLoading,
    pageIndex,
    pageSize,
    handleSearch,
    handleClearFilters,
    handleBusinessChange,
    handleBudgetNumberChange,
    handleInvoiceNumberChange,
    handleClientNameChange,
    handlePageChange,
    handlePageSizeChange,
  } = useInvoiceSearch();

  // IDs of invoices that already have a corrective (fetched without pagination)
  const [rectifiedIds, setRectifiedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getRectifiedInvoiceIds().then((ids) => setRectifiedIds(new Set(ids)));
  }, []);

  // Load invoicesTypes and taxesTypes on mount if not already loaded
  useEffect(() => {
    if (invoicesTypes.length === 0) {
      dispatch(fetchAllInvoicesTypes());
    }
    if (taxesTypes.length === 0) {
      dispatch(fetchAllTaxesTypes());
    }
  }, [dispatch, invoicesTypes.length, taxesTypes.length]);

  // Corrective invoice modal states
  const [isCorrectiveModalOpen, setIsCorrectiveModalOpen] = useState(false);
  const [selectedInvoiceForCorrective, setSelectedInvoiceForCorrective] =
    useState<Invoice | null>(null);

  // Edit invoice modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] =
    useState<Invoice | null>(null);
  const [editBusinessId, setEditBusinessId] = useState("");
  const [editInvoicesTypeId, setEditInvoicesTypeId] = useState("");
  const [editTaxesTypeId, setEditTaxesTypeId] = useState("");
  const [editAdditionalData, setEditAdditionalData] = useState("");
  const [editCreatedAt, setEditCreatedAt] = useState("");
  const [editCouponDiscount, setEditCouponDiscount] = useState(0);
  const [editInvoiceTo, setEditInvoiceTo] = useState<"titular" | "empresa">("titular");
  const [editUser, setEditUser] = useState<User | null>(null);

  const handleCloseAlert = () => {
    dispatch(clearInvoicesErrors());
  };

  // --- Corrective modal handlers ---
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
        // Refresh invoices list and rectified IDs
        dispatch(
          fetchAllInvoices({
            businessId: appliedFilters.businessId || undefined,
            budgetReference: appliedFilters.budgetNumber || undefined,
            invoiceNumber: appliedFilters.invoiceNumber || undefined,
            clientName: appliedFilters.clientName || undefined,
            page: pageIndex,
            pageSize,
          }),
        );
        getRectifiedInvoiceIds().then((ids) => setRectifiedIds(new Set(ids)));
      }
    },
    [
      selectedInvoiceForCorrective,
      dispatch,
      appliedFilters,
      pageIndex,
      pageSize,
      handleCloseCorrectiveModal,
    ],
  );

  // --- Edit modal handlers ---
  const handleOpenEditModal = useCallback(async (invoice: Invoice) => {
    setSelectedInvoiceForEdit(invoice);
    setEditBusinessId(invoice.business_id);
    setEditInvoicesTypeId(invoice.invoices_type_id);
    setEditTaxesTypeId(invoice.taxes_type_id);
    setEditAdditionalData(invoice.additional_data || "");
    setEditCreatedAt(
      invoice.created_at ? invoice.created_at.split("T")[0] : "",
    );

    // Fetch budget to get coupon_discount and user
    if (invoice.budget_reference) {
      try {
        const budget = await getBudgetByReference(invoice.budget_reference);

        // For old invoices (coupon_discount not stored), use budget value
        if (!invoice.coupon_discount && budget?.totalCouponDiscount) {
          setEditCouponDiscount(budget.totalCouponDiscount);
        } else {
          setEditCouponDiscount(invoice.coupon_discount || 0);
        }

        // Fetch fresh user data for titular/empresa selection
        if (budget?.user?.id) {
          try {
            const freshUser = await dispatch(
              fetchUserDetails(budget.user.id),
            ).unwrap();
            setEditUser(freshUser);
            // Default to "empresa" if user has company data, otherwise "titular"
            const hasCompany = !!(freshUser.company?.name && freshUser.company?.nif);
            setEditInvoiceTo(hasCompany ? "empresa" : "titular");
          } catch {
            setEditUser(null);
            setEditInvoiceTo("titular");
          }
        }
      } catch {
        setEditCouponDiscount(invoice.coupon_discount || 0);
      }
    } else {
      setEditCouponDiscount(invoice.coupon_discount || 0);
    }

    setIsEditModalOpen(true);
  }, [dispatch]);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedInvoiceForEdit(null);
    setEditBusinessId("");
    setEditInvoicesTypeId("");
    setEditTaxesTypeId("");
    setEditAdditionalData("");
    setEditCreatedAt("");
    setEditCouponDiscount(0);
    setEditInvoiceTo("titular");
    setEditUser(null);
    dispatch(resetUpdateInvoiceRequest());
  }, [dispatch]);

  const handleSaveEdit = useCallback(async () => {
    if (!selectedInvoiceForEdit) return;

    const invoice = selectedInvoiceForEdit;

    // Determine current and new invoice types
    const currentInvoiceType = invoicesTypes.find(
      (t) => t.id === invoice.invoices_type_id,
    );
    const newInvoiceType = invoicesTypes.find(
      (t) => t.id === editInvoicesTypeId,
    );
    const newTaxType = taxesTypes.find((t) => t.id === editTaxesTypeId);

    if (!newInvoiceType || !newTaxType) return;

    // Start with current values
    let adjustedPrice = { ...invoice.price };
    let adjustedBudgetlines = [...invoice.budgetlines];

    // If invoice type percentage changed, recalculate prices
    const currentPercentage = currentInvoiceType?.percentage ?? 100;
    const newPercentage = newInvoiceType.percentage;

    if (currentPercentage !== newPercentage && currentPercentage !== 0) {
      const ratio = newPercentage / currentPercentage;

      adjustedPrice = {
        ...adjustedPrice,
        subTotal: Math.round(invoice.price.subTotal * ratio * 100) / 100,
        extras: Math.round(invoice.price.extras * ratio * 100) / 100,
        costSend: Math.round(invoice.price.costSend * ratio * 100) / 100,
        userDiscount:
          Math.round(invoice.price.userDiscount * ratio * 100) / 100,
        packs: Math.round(invoice.price.packs * ratio * 100) / 100,
        subTotalWithExtras:
          Math.round(invoice.price.subTotalWithExtras * ratio * 100) / 100,
        alreadyPaid: Math.round(invoice.price.alreadyPaid * ratio * 100) / 100,
      };

      adjustedBudgetlines = invoice.budgetlines.map((line) => ({
        ...line,
        precioUd: Math.round(line.precioUd * ratio * 100) / 100,
        totalPrice: Math.round(line.totalPrice * ratio * 100) / 100,
        costetotal: Math.round(line.costetotal * ratio * 100) / 100,
      }));
    }

    // Recalculate VAT with the new tax rate.
    // For new invoices: coupon is already folded into userDiscount — no extra subtraction.
    // For old invoices: coupon was NOT in userDiscount, so we subtract editCouponDiscount
    // (fetched from the original budget) scaled to the new invoice type percentage.
    const isOldInvoice = !invoice.coupon_discount && editCouponDiscount > 0;
    const scaledCoupon = isOldInvoice
      ? Math.round(editCouponDiscount * (newPercentage / 100) * 100) / 100
      : 0;

    const vatBase =
      adjustedPrice.subTotal +
      adjustedPrice.extras +
      adjustedPrice.costSend -
      adjustedPrice.userDiscount -
      scaledCoupon;
    adjustedPrice.vat =
      Math.round(vatBase * (newTaxType.tax / 100) * 100) / 100;
    adjustedPrice.total = Math.round((vatBase + adjustedPrice.vat) * 100) / 100;

    // For old invoices, also update userDiscount to include the coupon going forward
    if (isOldInvoice) {
      adjustedPrice.userDiscount =
        Math.round((adjustedPrice.userDiscount + scaledCoupon) * 100) / 100;
    }

    // Use fresh user data if available, otherwise fall back to stored invoice fields
    const clientData = editUser
      ? getClientDataFromUser(editUser, editInvoiceTo)
      : {
          client_name: invoice.client_name,
          client_nif: invoice.client_nif,
          client_email: invoice.client_email,
          client_address: invoice.client_address,
          client_locality: invoice.client_locality,
          client_postal_code: invoice.client_postal_code,
          client_phone: invoice.client_phone,
        };

    const result = await dispatch(
      updateInvoice({
        invoiceId: invoice.id,
        data: {
          business_id: editBusinessId,
          invoices_type_id: editInvoicesTypeId,
          taxes_type_id: editTaxesTypeId,
          budgetlines: adjustedBudgetlines,
          price: adjustedPrice,
          ...clientData,
          additional_data: editAdditionalData,
          coupon_discount: editCouponDiscount,
          created_at: editCreatedAt
            ? new Date(editCreatedAt).toISOString()
            : undefined,
          event_date: invoice.event_date ?? null,
        },
      }),
    );

    if (updateInvoice.fulfilled.match(result)) {
      handleCloseEditModal();
      // Refresh invoices list
      dispatch(
        fetchAllInvoices({
          businessId: appliedFilters.businessId || undefined,
          budgetReference: appliedFilters.budgetNumber || undefined,
          clientName: appliedFilters.clientName || undefined,
          page: pageIndex,
          pageSize,
        }),
      );
    }
  }, [
    selectedInvoiceForEdit,
    invoicesTypes,
    taxesTypes,
    editBusinessId,
    editInvoicesTypeId,
    editTaxesTypeId,
    editAdditionalData,
    editCreatedAt,
    editCouponDiscount,
    editUser,
    editInvoiceTo,
    dispatch,
    appliedFilters,
    pageIndex,
    pageSize,
    handleCloseEditModal,
  ]);

  return (
    <>
      <AlertInvoices
        fetchInvoicesRequest={fetchInvoicesRequest}
        createCorrectiveInvoiceRequest={createCorrectiveInvoiceRequest}
        updateInvoiceRequest={updateInvoiceRequest}
        onClose={handleCloseAlert}
      />

      <ModalCreateCorrectiveInvoice
        isOpen={isCorrectiveModalOpen}
        onClose={handleCloseCorrectiveModal}
        onConfirm={handleCreateCorrective}
        invoice={selectedInvoiceForCorrective}
        isCreating={createCorrectiveInvoiceRequest.inProgress}
      />

      <ModalEditInvoice
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
        invoice={selectedInvoiceForEdit}
        businesses={businesses}
        invoicesTypes={invoicesTypes}
        taxesTypes={taxesTypes}
        selectedBusinessId={editBusinessId}
        selectedInvoicesTypeId={editInvoicesTypeId}
        setSelectedInvoicesTypeId={setEditInvoicesTypeId}
        selectedTaxesTypeId={editTaxesTypeId}
        setSelectedTaxesTypeId={setEditTaxesTypeId}
        additionalData={editAdditionalData}
        setAdditionalData={setEditAdditionalData}
        createdAt={editCreatedAt}
        setCreatedAt={setEditCreatedAt}
        isUpdating={updateInvoiceRequest.inProgress}
        invoiceTo={editInvoiceTo}
        setInvoiceTo={setEditInvoiceTo}
        editUser={editUser}
      />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Facturas" description="Gestiona tus facturas" />

        {/* Filtros */}
        <SearchInvoices
          selectedBusinessId={selectedBusinessId}
          budgetNumber={budgetNumber}
          invoiceNumber={invoiceNumber}
          clientName={clientName}
          appliedFilters={appliedFilters}
          businesses={businesses}
          isLoading={isLoading}
          onBusinessChange={handleBusinessChange}
          onBudgetNumberChange={handleBudgetNumberChange}
          onInvoiceNumberChange={handleInvoiceNumberChange}
          onClientNameChange={handleClientNameChange}
          onSearch={handleSearch}
          onClearFilters={handleClearFilters}
        />

        {/* Tabla de facturas */}
        <InvoicesTable
          invoices={invoices}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          isLoading={fetchInvoicesRequest.inProgress}
          rectifiedIds={rectifiedIds}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onOpenCorrectiveModal={handleOpenCorrectiveModal}
          onEditInvoice={handleOpenEditModal}
        />
      </div>
    </>
  );
};

export default Invoices;
