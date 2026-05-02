import { useState, useCallback } from "react";

export interface UsersAppliedFilters {
  email: string;
  firstName: string;
  lastName: string;
  dnif: string;
  phone: string;
}

interface UseUserSearchReturn {
  email: string;
  setEmail: (value: string) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  dnif: string;
  setDnif: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  appliedFilters: UsersAppliedFilters;
  handleSearch: () => void;
  handleClearFilters: () => void;
  buildFiltersQuery: () => string;
}

const emptyFilters: UsersAppliedFilters = {
  email: "",
  firstName: "",
  lastName: "",
  dnif: "",
  phone: "",
};

export const useUserSearch = (): UseUserSearchReturn => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dnif, setDnif] = useState("");
  const [phone, setPhone] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<UsersAppliedFilters>(emptyFilters);

  const buildFiltersQuery = useCallback((): string => {
    const filters: string[] = [];

    if (appliedFilters.email) {
      filters.push(`email=${encodeURIComponent(appliedFilters.email)}`);
    }
    if (appliedFilters.firstName) {
      filters.push(`firstName=${encodeURIComponent(appliedFilters.firstName)}`);
    }
    if (appliedFilters.lastName) {
      filters.push(`lastName=${encodeURIComponent(appliedFilters.lastName)}`);
    }
    if (appliedFilters.dnif) {
      filters.push(`dnif=${encodeURIComponent(appliedFilters.dnif)}`);
    }
    if (appliedFilters.phone) {
      filters.push(`phone=${encodeURIComponent(appliedFilters.phone)}`);
    }

    return filters.join("&");
  }, [appliedFilters]);

  const handleSearch = useCallback(() => {
    setAppliedFilters({
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dnif: dnif.trim(),
      phone: phone.trim(),
    });
  }, [email, firstName, lastName, dnif, phone]);

  const handleClearFilters = useCallback(() => {
    setEmail("");
    setFirstName("");
    setLastName("");
    setDnif("");
    setPhone("");
    setAppliedFilters(emptyFilters);
  }, []);

  return {
    email,
    setEmail,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    dnif,
    setDnif,
    phone,
    setPhone,
    appliedFilters,
    handleSearch,
    handleClearFilters,
    buildFiltersQuery,
  };
};
