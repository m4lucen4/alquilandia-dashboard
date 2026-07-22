import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAllInvoices } from "@/redux/actions/invoices";
import { fetchAllBusiness } from "@/redux/actions/business";

export const useInvoiceSearch = () => {
  const dispatch = useAppDispatch();
  const { businesses } = useAppSelector((state) => state.business);
  const { fetchInvoicesRequest } = useAppSelector((state) => state.invoices);

  // Filter input states (controlled inputs)
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [budgetNumber, setBudgetNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Applied filters state (triggers actual search)
  const [appliedFilters, setAppliedFilters] = useState({
    businessId: "",
    budgetNumber: "",
    invoiceNumber: "",
  });

  // Load businesses on mount if not already loaded
  useEffect(() => {
    if (businesses.length === 0) {
      dispatch(fetchAllBusiness());
    }
  }, [dispatch, businesses.length]);

  // Fetch invoices when applied filters, page, or page size changes
  useEffect(() => {
    dispatch(
      fetchAllInvoices({
        businessId: appliedFilters.businessId || undefined,
        budgetReference: appliedFilters.budgetNumber || undefined,
        invoiceNumber: appliedFilters.invoiceNumber || undefined,
        page: pageIndex,
        pageSize,
      }),
    );
  }, [dispatch, appliedFilters, pageIndex, pageSize]);

  // Handle search action (apply current filter values and reset to page 1)
  const handleSearch = useCallback(() => {
    setPageIndex(0); // Reset to first page when searching
    setAppliedFilters({
      businessId: selectedBusinessId,
      budgetNumber: budgetNumber.trim(),
      invoiceNumber: invoiceNumber.trim(),
    });
  }, [selectedBusinessId, budgetNumber, invoiceNumber]);

  // Handle clear filters action
  const handleClearFilters = useCallback(() => {
    setSelectedBusinessId("");
    setBudgetNumber("");
    setInvoiceNumber("");
    setPageIndex(0); // Reset to first page
    setAppliedFilters({
      businessId: "",
      budgetNumber: "",
      invoiceNumber: "",
    });
  }, []);

  // Handle business selection change
  const handleBusinessChange = useCallback((businessId: string) => {
    setSelectedBusinessId(businessId);
  }, []);

  // Handle budget number input change
  const handleBudgetNumberChange = useCallback((value: string) => {
    setBudgetNumber(value);
  }, []);

  // Handle invoice number input change
  const handleInvoiceNumberChange = useCallback((value: string) => {
    setInvoiceNumber(value);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPageIndex(newPage);
  }, []);

  // Handle page size change (reset to first page)
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  }, []);

  return {
    // Filter states
    selectedBusinessId,
    budgetNumber,
    invoiceNumber,
    appliedFilters,

    // Pagination
    pageIndex,
    pageSize,

    // Data
    businesses,
    isLoading: fetchInvoicesRequest.inProgress,

    // Handlers
    handleSearch,
    handleClearFilters,
    handleBusinessChange,
    handleBudgetNumberChange,
    handleInvoiceNumberChange,
    handlePageChange,
    handlePageSizeChange,
  };
};
