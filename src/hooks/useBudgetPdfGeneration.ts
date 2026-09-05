import { useCallback, useState } from "react";
import { fetchUserDetails } from "@/redux/actions/users";
import { useAppDispatch } from "@/redux/hooks";
import { getClientDataFromUser } from "@/helpers/budgets";
import { generateBudgetPDF } from "@/services/pdfService";
import type { Budget } from "@/types/budgets";
import type { Business } from "@/types/business";

interface UseBudgetPdfGenerationProps {
  businesses: Business[];
}

export const useBudgetPdfGeneration = ({ businesses }: UseBudgetPdfGenerationProps) => {
  const dispatch = useAppDispatch();
  const [isBudgetPdfModalOpen, setIsBudgetPdfModalOpen] = useState(false);
  const [selectedBudgetForPdf, setSelectedBudgetForPdf] = useState<Budget | null>(null);
  const [pdfBusinessId, setPdfBusinessId] = useState("");
  const [pdfInvoiceTo, setPdfInvoiceTo] = useState<"titular" | "empresa">("titular");
  const [pdfDate, setPdfDate] = useState("");
  const [pdfIncludeVAT, setPdfIncludeVAT] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleOpenBudgetPdfModal = useCallback(
    (budget: Budget) => {
      setSelectedBudgetForPdf(budget);
      const defaultBusiness = businesses.find((business) => business.is_default);
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

    const business = businesses.find((company) => company.id === pdfBusinessId);
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
    businesses,
    dispatch,
    handleCloseBudgetPdfModal,
    pdfBusinessId,
    pdfDate,
    pdfIncludeVAT,
    pdfInvoiceTo,
    selectedBudgetForPdf,
  ]);

  return {
    isBudgetPdfModalOpen,
    selectedBudgetForPdf,
    pdfBusinessId,
    setPdfBusinessId,
    pdfInvoiceTo,
    setPdfInvoiceTo,
    pdfDate,
    setPdfDate,
    pdfIncludeVAT,
    setPdfIncludeVAT,
    isGeneratingPdf,
    handleOpenBudgetPdfModal,
    handleCloseBudgetPdfModal,
    handleGenerateBudgetPdf,
  };
};
