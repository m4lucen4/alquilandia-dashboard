import { useState, useCallback } from "react";

export interface InventoryAppliedFilters {
  visibility: "" | "true" | "false";
  principal: string;
  categoriaId: string;
  elemento: string;
}

interface UseInventorySearchReturn {
  filterVisibility: "" | "true" | "false";
  setFilterVisibility: (value: "" | "true" | "false") => void;
  filterPrincipal: string;
  setFilterPrincipal: (value: string) => void;
  filterCategoriaId: string;
  setFilterCategoriaId: (value: string) => void;
  filterElemento: string;
  setFilterElemento: (value: string) => void;
  appliedFilters: InventoryAppliedFilters;
  handleSearch: () => void;
  handleClearFilters: () => void;
  buildFiltersQuery: () => string;
}

const emptyFilters: InventoryAppliedFilters = {
  visibility: "",
  principal: "",
  categoriaId: "",
  elemento: "",
};

export const useInventorySearch = (): UseInventorySearchReturn => {
  const [filterVisibility, setFilterVisibility] = useState<"" | "true" | "false">("");
  const [filterPrincipal, setFilterPrincipalRaw] = useState("");
  const [filterCategoriaId, setFilterCategoriaId] = useState("");
  const [filterElemento, setFilterElemento] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<InventoryAppliedFilters>(emptyFilters);

  const setFilterPrincipal = useCallback((value: string) => {
    setFilterPrincipalRaw(value);
    setFilterCategoriaId("");
  }, []);

  const buildFiltersQuery = useCallback((): string => {
    const params = new URLSearchParams();
    if (appliedFilters.elemento) params.set("elemento", appliedFilters.elemento);
    if (appliedFilters.principal) params.set("categoria", appliedFilters.principal);
    if (appliedFilters.categoriaId) params.set("subcategoria", appliedFilters.categoriaId);
    if (appliedFilters.visibility) params.set("private", appliedFilters.visibility);
    return params.toString();
  }, [appliedFilters]);

  const handleSearch = useCallback(() => {
    setAppliedFilters({
      visibility: filterVisibility,
      principal: filterPrincipal,
      categoriaId: filterCategoriaId,
      elemento: filterElemento.trim(),
    });
  }, [filterVisibility, filterPrincipal, filterCategoriaId, filterElemento]);

  const handleClearFilters = useCallback(() => {
    setFilterVisibility("");
    setFilterPrincipalRaw("");
    setFilterCategoriaId("");
    setFilterElemento("");
    setAppliedFilters(emptyFilters);
  }, []);

  return {
    filterVisibility,
    setFilterVisibility,
    filterPrincipal,
    setFilterPrincipal,
    filterCategoriaId,
    setFilterCategoriaId,
    filterElemento,
    setFilterElemento,
    appliedFilters,
    handleSearch,
    handleClearFilters,
    buildFiltersQuery,
  };
};
