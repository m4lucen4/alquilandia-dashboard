import { type FC, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import type { InventoryCategory } from "@/types/inventoryCategories";
import { buildCatalogFiltersQuery } from "@/helpers/inventoryFilters";
import Button from "@/components/shared/Button";
import SelectField from "@/components/shared/SelectField";
import InputField from "@/components/shared/InputField";

interface FiltersFormValues {
  elemento: string;
  principal: string;
  subcategoria: string;
}

interface CatalogFiltersProps {
  categories: InventoryCategory[];
  isLoading: boolean;
  onSearch: (filtersQuery: string) => void;
}

const formClasses = "rounded-2xl bg-white p-4 shadow-sm";
const gridClasses = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end";

export const CatalogFilters: FC<CatalogFiltersProps> = ({
  categories,
  isLoading,
  onSearch,
}) => {
  const { control, handleSubmit, watch, reset, setValue } = useForm<FiltersFormValues>({
    defaultValues: { elemento: "", principal: "", subcategoria: "" },
  });

  const selectedPrincipal = watch("principal");

  const principalOptions = useMemo(() => {
    const uniquePrincipals = [...new Set(categories.map((c) => c.principal))];
    return uniquePrincipals.map((p) => ({ value: p, label: p }));
  }, [categories]);

  const subcategoriaOptions = useMemo(() => {
    if (!selectedPrincipal) return [];
    return categories
      .filter((c) => c.principal === selectedPrincipal)
      .map((c) => ({ value: c.nombre, label: c.nombre }));
  }, [categories, selectedPrincipal]);

  const handlePrincipalChange = (value: string) => {
    setValue("subcategoria", "");
    setValue("principal", value);
  };

  const handleSearch = (values: FiltersFormValues) => {
    const query = buildCatalogFiltersQuery({
      elemento: values.elemento,
      categoria: values.principal,
      subcategoria: values.subcategoria,
    });
    onSearch(query);
  };

  const handleClear = () => {
    reset();
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit(handleSearch)} className={formClasses}>
      <div className={gridClasses}>
        {/* Categoría principal */}
        <Controller
          name="principal"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Categoría"
              name="principal"
              value={field.value}
              onChange={(e) => handlePrincipalChange(e.target.value)}
              options={principalOptions}
              placeholder="Todas"
            />
          )}
        />

        {/* Subcategoría */}
        <Controller
          name="subcategoria"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Subcategoría"
              name="subcategoria"
              value={field.value}
              onChange={field.onChange}
              options={subcategoriaOptions}
              placeholder="Todas"
              disabled={!selectedPrincipal}
            />
          )}
        />

        {/* Búsqueda por nombre */}
        <Controller
          name="elemento"
          control={control}
          render={({ field }) => (
            <InputField
              label="Elemento"
              name="elemento"
              value={field.value}
              onChange={field.onChange}
              placeholder="Buscar por nombre..."
            />
          )}
        />

        {/* Botones */}
        <div className="flex gap-2">
          <Button
            title="Limpiar"
            onClick={handleClear}
            variant="secondary"
            size="sm"
            type="button"
          />
          <Button
            title="Buscar"
            onClick={handleSubmit(handleSearch)}
            variant="primary"
            size="sm"
            loading={isLoading}
            type="submit"
          />
        </div>
      </div>
    </form>
  );
};
