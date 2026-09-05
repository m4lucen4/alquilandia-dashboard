import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createInvoice } from "@/redux/actions/invoices";
import { fetchUserDetails } from "@/redux/actions/users";
import { useAppDispatch } from "@/redux/hooks";
import { resetCreateInvoiceRequest } from "@/redux/slices/invoicesSlice";
import {
  adjustBudgetLines,
  calculateAdjustedPrice,
  getClientDataFromUser,
} from "@/helpers/budgets";
import { generateProformaPDF } from "@/services/pdfService";
import type { Budget } from "@/types/budgets";
import type { Business } from "@/types/business";
import type { InvoicesType } from "@/types/invoicesTypes";
import type { TaxesType } from "@/types/taxesTypes";

interface UseInvoiceGenerationProps {
  businesses: Business[];
  invoicesTypes: InvoicesType[];
  taxesTypes: TaxesType[];
}

export const useInvoiceGeneration = ({
  businesses,
  invoicesTypes,
  taxesTypes,
}: UseInvoiceGenerationProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedInvoicesTypeId, setSelectedInvoicesTypeId] = useState("");
  const [selectedTaxesTypeId, setSelectedTaxesTypeId] = useState("");
  const [invoiceTo, setInvoiceTo] = useState<"titular" | "empresa">("titular");
  const [additionalData, setAdditionalData] = useState("");
  const [createdAt, setCreatedAt] = useState("");

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

  const handleOpenModal = useCallback(
    (budget: Budget) => {
      setSelectedBudget(budget);
      const defaultBusiness = businesses.find((business) => business.is_default);
      if (defaultBusiness) {
        setSelectedBusinessId(defaultBusiness.id);
      }
      setCreatedAt(new Date().toISOString().split("T")[0]);
      setIsModalOpen(true);
    },
    [businesses],
  );

  const handleGenerateInvoice = useCallback(async () => {
    if (
      !selectedBudget ||
      !selectedBusinessId ||
      !selectedInvoicesTypeId ||
      !selectedTaxesTypeId
    ) {
      return;
    }

    const freshUser = await dispatch(
      fetchUserDetails(selectedBudget.user.id),
    ).unwrap();
    const clientData = getClientDataFromUser(freshUser, invoiceTo);

    if (
      selectedInvoicesTypeId === "proforma-25" ||
      selectedInvoicesTypeId === "proforma-100"
    ) {
      const factor = selectedInvoicesTypeId === "proforma-25" ? 0.25 : 1;
      const taxType = taxesTypes.find((tax) => tax.id === selectedTaxesTypeId);
      const taxRate = taxType?.tax ?? 0;
      const business = businesses.find(
        (company) => company.id === selectedBusinessId,
      );
      if (!business) return;

      const blob = await generateProformaPDF(
        selectedBudget,
        business,
        clientData,
        factor,
        taxRate,
        createdAt || new Date().toISOString().slice(0, 10),
        selectedInvoicesTypeId === "proforma-100",
        additionalData || undefined,
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `proforma_${selectedBudget.budgetReference}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      handleCloseModal();
      return;
    }

    const invoiceType = invoicesTypes.find(
      (type) => type.id === selectedInvoicesTypeId,
    );
    const taxType = taxesTypes.find((tax) => tax.id === selectedTaxesTypeId);
    const factor = (invoiceType?.percentage ?? 100) / 100;
    const taxRate = taxType?.tax ?? 0;
    const adjustedPrice = calculateAdjustedPrice(
      selectedBudget.price,
      factor,
      taxRate,
      selectedBudget.totalCouponDiscount || 0,
    );
    const adjustedBudgetLines = adjustBudgetLines(selectedBudget.budgetLines, factor);

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
      navigate("/accounting/invoices");
    }
  }, [
    additionalData,
    businesses,
    createdAt,
    dispatch,
    handleCloseModal,
    invoiceTo,
    invoicesTypes,
    navigate,
    selectedBudget,
    selectedBusinessId,
    selectedInvoicesTypeId,
    selectedTaxesTypeId,
    taxesTypes,
  ]);

  return {
    isModalOpen,
    selectedBudget,
    selectedBusinessId,
    setSelectedBusinessId,
    selectedInvoicesTypeId,
    setSelectedInvoicesTypeId,
    selectedTaxesTypeId,
    setSelectedTaxesTypeId,
    invoiceTo,
    setInvoiceTo,
    additionalData,
    setAdditionalData,
    createdAt,
    setCreatedAt,
    handleOpenModal,
    handleCloseModal,
    handleGenerateInvoice,
  };
};
