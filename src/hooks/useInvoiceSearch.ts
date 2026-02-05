import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAllInvoices } from "@/redux/actions/invoices";
import { fetchAllBusiness } from "@/redux/actions/business";

const PAGE_SIZE = 5;

export const useInvoiceSearch = () => {
  const dispatch = useAppDispatch();
  const { businesses } = useAppSelector((state) => state.business);
  const { fetchInvoicesRequest } = useAppSelector((state) => state.invoices);

  // Filter input states (controlled inputs)
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [budgetNumber, setBudgetNumber] = useState("");

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);

  // Applied filters state (triggers actual search)
  const [appliedFilters, setAppliedFilters] = useState({
    businessId: "",
    budgetNumber: "",
  });

  // Load businesses on mount if not already loaded
  useEffect(() => {
    if (businesses.length === 0) {
      dispatch(fetchAllBusiness());
    }
  }, [dispatch, businesses.length]);

  // Fetch invoices when applied filters or page changes
  useEffect(() => {
    dispatch(
      fetchAllInvoices({
        businessId: appliedFilters.businessId || undefined,
        budgetReference: appliedFilters.budgetNumber || undefined,
        page: pageIndex,
        pageSize: PAGE_SIZE,
      }),
    );
  }, [dispatch, appliedFilters, pageIndex]);

  // Handle search action (apply current filter values and reset to page 1)
  const handleSearch = useCallback(() => {
    setPageIndex(0); // Reset to first page when searching
    setAppliedFilters({
      businessId: selectedBusinessId,
      budgetNumber: budgetNumber.trim(),
    });
  }, [selectedBusinessId, budgetNumber]);

  // Handle clear filters action
  const handleClearFilters = useCallback(() => {
    setSelectedBusinessId("");
    setBudgetNumber("");
    setPageIndex(0); // Reset to first page
    setAppliedFilters({
      businessId: "",
      budgetNumber: "",
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

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPageIndex(newPage);
  }, []);

  return {
    // Filter states
    selectedBusinessId,
    budgetNumber,
    appliedFilters,

    // Pagination
    pageIndex,
    pageSize: PAGE_SIZE,

    // Data
    businesses,
    isLoading: fetchInvoicesRequest.inProgress,

    // Handlers
    handleSearch,
    handleClearFilters,
    handleBusinessChange,
    handleBudgetNumberChange,
    handlePageChange,
  };
};
