import { useState, useCallback } from "react";

interface UseBudgetSearchReturn {
  budgetNumber: string;
  setBudgetNumber: (value: string) => void;
  clientName: string;
  setClientName: (value: string) => void;
  appliedFilters: {
    budgetNumber: string;
    clientName: string;
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

  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    budgetNumber: "",
    clientName: "",
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

    return filters.join("&");
  }, [appliedFilters]);

  /**
   * Applies current input values as filters
   */
  const handleSearch = useCallback(() => {
    setAppliedFilters({
      budgetNumber: budgetNumber.trim(),
      clientName: clientName.trim(),
    });
  }, [budgetNumber, clientName]);

  /**
   * Clears all search inputs and applied filters
   */
  const handleClearFilters = useCallback(() => {
    setBudgetNumber("");
    setClientName("");
    setAppliedFilters({
      budgetNumber: "",
      clientName: "",
    });
  }, []);

  return {
    budgetNumber,
    setBudgetNumber,
    clientName,
    setClientName,
    appliedFilters,
    handleSearch,
    handleClearFilters,
    buildFiltersQuery,
  };
};
