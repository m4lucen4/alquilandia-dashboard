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

  // Fetch invoices when applied filters change
  useEffect(() => {
    dispatch(
      fetchAllInvoices({
        businessId: appliedFilters.businessId || undefined,
        budgetReference: appliedFilters.budgetNumber || undefined,
      }),
    );
  }, [dispatch, appliedFilters]);

  // Handle search action (apply current filter values)
  const handleSearch = useCallback(() => {
    setAppliedFilters({
      businessId: selectedBusinessId,
      budgetNumber: budgetNumber.trim(),
    });
  }, [selectedBusinessId, budgetNumber]);

  // Handle clear filters action
  const handleClearFilters = useCallback(() => {
    setSelectedBusinessId("");
    setBudgetNumber("");
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

  return {
    // Filter states
    selectedBusinessId,
    budgetNumber,
    appliedFilters,

    // Data
    businesses,
    isLoading: fetchInvoicesRequest.inProgress,

    // Handlers
    handleSearch,
    handleClearFilters,
    handleBusinessChange,
    handleBudgetNumberChange,
  };
};
