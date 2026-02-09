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
  eventDateFrom: string;
  setEventDateFrom: (value: string) => void;
  eventDateTo: string;
  setEventDateTo: (value: string) => void;
  creationDateFrom: string;
  setCreationDateFrom: (value: string) => void;
  creationDateTo: string;
  setCreationDateTo: (value: string) => void;
  appliedFilters: {
    budgetNumber: string;
    clientName: string;
    phone: string;
    status: string;
    eventDateFrom: string;
    eventDateTo: string;
    creationDateFrom: string;
    creationDateTo: string;
  };
  handleSearch: () => void;
  handleClearFilters: () => void;
  buildFiltersQuery: () => string;
}

/**
 * Converts a date string (YYYY-MM-DD) to ISO timestamp format
 * Returns "null" string if date is empty (for API compatibility)
 */
const dateToISOTimestamp = (dateString: string): string => {
  if (!dateString) return "null";

  // Create date at start of day in local timezone
  const date = new Date(dateString + "T00:00:00");
  return date.toISOString();
};

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
  const [eventDateFrom, setEventDateFrom] = useState("");
  const [eventDateTo, setEventDateTo] = useState("");
  const [creationDateFrom, setCreationDateFrom] = useState("");
  const [creationDateTo, setCreationDateTo] = useState("");

  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    budgetNumber: "",
    clientName: "",
    phone: "",
    status: "",
    eventDateFrom: "",
    eventDateTo: "",
    creationDateFrom: "",
    creationDateTo: "",
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

    // Add date range filters with ISO timestamp format
    // API expects "null" string when no date is selected
    filters.push(
      `eventDateFrom=${dateToISOTimestamp(appliedFilters.eventDateFrom)}`,
    );
    filters.push(
      `eventDateTo=${dateToISOTimestamp(appliedFilters.eventDateTo)}`,
    );
    filters.push(
      `creationDateFrom=${dateToISOTimestamp(appliedFilters.creationDateFrom)}`,
    );
    filters.push(
      `creationDateTo=${dateToISOTimestamp(appliedFilters.creationDateTo)}`,
    );

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
      eventDateFrom: eventDateFrom.trim(),
      eventDateTo: eventDateTo.trim(),
      creationDateFrom: creationDateFrom.trim(),
      creationDateTo: creationDateTo.trim(),
    });
  }, [
    budgetNumber,
    clientName,
    phone,
    status,
    eventDateFrom,
    eventDateTo,
    creationDateFrom,
    creationDateTo,
  ]);

  /**
   * Clears all search inputs and applied filters
   */
  const handleClearFilters = useCallback(() => {
    setBudgetNumber("");
    setClientName("");
    setPhone("");
    setStatus("");
    setEventDateFrom("");
    setEventDateTo("");
    setCreationDateFrom("");
    setCreationDateTo("");
    setAppliedFilters({
      budgetNumber: "",
      clientName: "",
      phone: "",
      status: "",
      eventDateFrom: "",
      eventDateTo: "",
      creationDateFrom: "",
      creationDateTo: "",
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
    eventDateFrom,
    setEventDateFrom,
    eventDateTo,
    setEventDateTo,
    creationDateFrom,
    setCreationDateFrom,
    creationDateTo,
    setCreationDateTo,
    appliedFilters,
    handleSearch,
    handleClearFilters,
    buildFiltersQuery,
  };
};
