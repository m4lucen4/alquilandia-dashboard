import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeReceiptProductsThunk } from "@/redux/actions/budgets";
import { createInvoice } from "@/redux/actions/invoices";
import { fetchUserDetails } from "@/redux/actions/users";
import { useAppDispatch } from "@/redux/hooks";
import { resetCreateInvoiceRequest } from "@/redux/slices/invoicesSlice";
import {
  buildBreakageInvoiceData,
  getClientDataFromUser,
  resolveBreakageInvoiceType,
} from "@/helpers/budgets";
import { generateInvoicePDF } from "@/services/pdfService";
import type { BreakageFormValues } from "@/components/budgets/ModalGenerateBreakageInvoice";
import type { Budget } from "@/types/budgets";
import type { Business } from "@/types/business";
import type { Invoice } from "@/types/invoices";
import type { InvoicesType } from "@/types/invoicesTypes";
import type { TaxesType } from "@/types/taxesTypes";

interface UseBreakageInvoiceProps {
  businesses: Business[];
  invoicesTypes: InvoicesType[];
  taxesTypes: TaxesType[];
}

export const useBreakageInvoice = ({
  businesses,
  invoicesTypes,
  taxesTypes,
}: UseBreakageInvoiceProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isBreakageModalOpen, setIsBreakageModalOpen] = useState(false);
  const [selectedBudgetForBreakage, setSelectedBudgetForBreakage] =
    useState<Budget | null>(null);
  const [isReducingInventory, setIsReducingInventory] = useState(false);
  const [isDownloadingAnnex, setIsDownloadingAnnex] = useState(false);
  const [reduceInventoryResult, setReduceInventoryResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const breakageInvoiceType = useMemo(
    () => resolveBreakageInvoiceType(invoicesTypes),
    [invoicesTypes],
  );

  const handleOpenBreakageModal = useCallback((budget: Budget) => {
    setSelectedBudgetForBreakage(budget);
    setReduceInventoryResult(null);
    setIsBreakageModalOpen(true);
  }, []);

  const handleCloseBreakageModal = useCallback(() => {
    setIsBreakageModalOpen(false);
    setSelectedBudgetForBreakage(null);
    setReduceInventoryResult(null);
    dispatch(resetCreateInvoiceRequest());
  }, [dispatch]);

  const handleReduceInventoryForBreakage = useCallback(
    async (values: BreakageFormValues) => {
      if (!selectedBudgetForBreakage) return;
      const brokenLines = values.lines.filter((line) => line.brokenUnits > 0);
      if (brokenLines.length === 0) return;

      setIsReducingInventory(true);
      setReduceInventoryResult(null);
      try {
        const { budgetlines, price } = buildBreakageInvoiceData(
          selectedBudgetForBreakage,
          brokenLines,
          21,
        );

        await dispatch(
          removeReceiptProductsThunk({
            budgetId: selectedBudgetForBreakage.budgetId,
            budgetReference: selectedBudgetForBreakage.budgetReference,
            budgetLines: budgetlines,
            clientEmail: selectedBudgetForBreakage.user.email,
            netTotal: price.subTotal,
            vatTotal: price.vat,
          }),
        ).unwrap();

        setReduceInventoryResult({
          ok: true,
          message: "Inventario reducido correctamente.",
        });
      } catch (error) {
        setReduceInventoryResult({
          ok: false,
          message:
            typeof error === "string"
              ? error
              : "No se pudo reducir el inventario.",
        });
      } finally {
        setIsReducingInventory(false);
      }
    },
    [dispatch, selectedBudgetForBreakage],
  );

  const handleDownloadBreakageAnnex = useCallback(
    async (values: BreakageFormValues) => {
      if (!selectedBudgetForBreakage) return;
      const business = businesses.find((company) => company.id === values.businessId);
      const taxType = taxesTypes.find((tax) => tax.id === values.taxesTypeId);
      if (!business || !taxType) return;

      setIsDownloadingAnnex(true);
      try {
        const { budgetlines, price } = buildBreakageInvoiceData(
          selectedBudgetForBreakage,
          values.lines,
          taxType.tax,
        );
        const freshUser = await dispatch(
          fetchUserDetails(selectedBudgetForBreakage.user.id),
        ).unwrap();
        const clientData = getClientDataFromUser(freshUser, "titular");
        const syntheticInvoice: Invoice = {
          id: "",
          business_id: business.id,
          invoices_type_id: breakageInvoiceType?.id ?? "",
          taxes_type_id: taxType.id,
          budget_reference: selectedBudgetForBreakage.budgetReference,
          invoice_number: 0,
          budgetlines,
          price,
          event_date: selectedBudgetForBreakage.eventDate,
          created_at: new Date(values.createdAt).toISOString(),
          additional_data: values.additionalData || undefined,
          ...clientData,
          business,
          invoices_type: breakageInvoiceType ?? {
            id: "",
            invoices: "Anexo de rotura",
            percentage: 100,
            concept: "Anexo de rotura del presupuesto (documento sin valor fiscal)",
            show_budgetlines: true,
          },
          taxes_type: taxType,
        };

        const blob = await generateInvoicePDF(syntheticInvoice);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `anexo_rotura_${selectedBudgetForBreakage.budgetReference}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      } finally {
        setIsDownloadingAnnex(false);
      }
    },
    [breakageInvoiceType, businesses, dispatch, selectedBudgetForBreakage, taxesTypes],
  );

  const handleGenerateBreakageInvoice = useCallback(
    async (values: BreakageFormValues) => {
      if (!selectedBudgetForBreakage || !breakageInvoiceType) return;

      const taxType = taxesTypes.find((tax) => tax.id === values.taxesTypeId);
      const taxRate = taxType?.tax ?? 0;
      const { budgetlines, price } = buildBreakageInvoiceData(
        selectedBudgetForBreakage,
        values.lines,
        taxRate,
      );
      const freshUser = await dispatch(
        fetchUserDetails(selectedBudgetForBreakage.user.id),
      ).unwrap();
      const clientData = getClientDataFromUser(freshUser, "titular");
      const result = await dispatch(
        createInvoice({
          business_id: values.businessId,
          invoices_type_id: breakageInvoiceType.id,
          taxes_type_id: values.taxesTypeId,
          budget_reference: selectedBudgetForBreakage.budgetReference,
          budgetlines,
          price,
          ...clientData,
          additional_data: values.additionalData || undefined,
          event_date: selectedBudgetForBreakage.eventDate,
          created_at: new Date(values.createdAt).toISOString(),
        }),
      );

      if (createInvoice.fulfilled.match(result)) {
        handleCloseBreakageModal();
        navigate("/accounting/invoices");
      }
    },
    [
      breakageInvoiceType,
      dispatch,
      handleCloseBreakageModal,
      navigate,
      selectedBudgetForBreakage,
      taxesTypes,
    ],
  );

  return {
    isBreakageModalOpen,
    selectedBudgetForBreakage,
    isReducingInventory,
    isDownloadingAnnex,
    reduceInventoryResult,
    setReduceInventoryResult,
    breakageInvoiceType,
    handleOpenBreakageModal,
    handleCloseBreakageModal,
    handleReduceInventoryForBreakage,
    handleDownloadBreakageAnnex,
    handleGenerateBreakageInvoice,
  };
};
