import { useState, useCallback } from "react";

interface UseBudgetSearchReturn {
  budgetNumber: string;
  setBudgetNumber: (value: string) => void;
  clientName: string;
  setClientName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  appliedFilters: {
    budgetNumber: string;
    clientName: string;
    phone: string;
    status: string;
  };
  handleSearch: () => void;
  handleClearFilters: () => void;
  buildFiltersQuery: () => string;
}

/**
 * Custom hook to manage budget search functionality
 * Handles search inputs, applied filters, and query building
 */
export const useBudgetSearch = (): UseBudgetSearchReturn => {
  // Search input states
  const [budgetNumber, setBudgetNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");

  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    budgetNumber: "",
    clientName: "",
    phone: "",
    status: "",
  });

  /**
   * Builds the query string for API filters
   */
  const buildFiltersQuery = useCallback((): string => {
    const filters: string[] = [];

    if (appliedFilters.budgetNumber) {
      filters.push(`budgetReference=${appliedFilters.budgetNumber}`);
    }

    if (appliedFilters.clientName) {
      filters.push(`client=${encodeURIComponent(appliedFilters.clientName)}`);
    }

    if (appliedFilters.phone) {
      filters.push(`phone=${encodeURIComponent(appliedFilters.phone)}`);
    }

    if (appliedFilters.status) {
      filters.push(`status=${encodeURIComponent(appliedFilters.status)}`);
    }

    return filters.join("&");
  }, [appliedFilters]);

  /**
   * Applies current input values as filters
   */
  const handleSearch = useCallback(() => {
    setAppliedFilters({
      budgetNumber: budgetNumber.trim(),
      clientName: clientName.trim(),
      phone: phone.trim(),
      status: status.trim(),
    });
  }, [budgetNumber, clientName, phone, status]);

  /**
   * Clears all search inputs and applied filters
   */
  const handleClearFilters = useCallback(() => {
    setBudgetNumber("");
    setClientName("");
    setPhone("");
    setStatus("");
    setAppliedFilters({
      budgetNumber: "",
      clientName: "",
      phone: "",
      status: "",
    });
  }, []);

  return {
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
  };
};
