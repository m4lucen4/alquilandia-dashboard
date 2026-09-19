import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Alert } from "@/components/shared/Alert";
import Button from "@/components/shared/Button";
import InputField from "@/components/shared/InputField";
import { Table } from "@/components/shared/Table";
import {
  createExpenseCategoryThunk,
  deleteExpenseCategoryThunk,
  fetchAllExpensesCategoriesThunk,
  fetchExpenseCategoryDetailsThunk,
  fetchExpensesCategoryOptionsThunk,
  fetchPaginatedExpensesCategoriesThunk,
  updateExpenseCategoryThunk,
} from "@/redux/actions/expensesCategories";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  clearExpenseCategoryDetails,
  resetExpenseCategoryMutationRequests,
} from "@/redux/slices/expensesCategoriesSlice";
import type {
  ExpenseCategory,
  ExpensesCategoriesFilters,
} from "@/types/expensesCategories";
import { ExpenseCategoryActionsMenu } from "./ExpenseCategoryActionsMenu";

const DEFAULT_PAGE_SIZE = 10;

const categorySchema = z.object({
  principal: z.string().trim().min(1, "Obligatorio"),
  subcategoria: z.string().trim().min(1, "Obligatorio"),
  iva: z.number().finite("Introduce un IVA válido").min(0, "Debe ser ≥ 0"),
});

const filtersSchema = z.object({
  principal: z.string(),
  secundario: z.string(),
  impuesto: z.string(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;
type FilterFormValues = z.infer<typeof filtersSchema>;

const emptyCategory: CategoryFormValues = {
  principal: "",
  subcategoria: "",
  iva: 0,
};

const toCategoryFilters = (values: FilterFormValues): ExpensesCategoriesFilters => {
  const impuesto = Number(values.impuesto);

  return {
    ...(values.principal ? { principal: values.principal } : {}),
    ...(values.secundario ? { subcategoria: values.secundario } : {}),
    ...(values.impuesto && Number.isFinite(impuesto) ? { iva: impuesto } : {}),
  };
};

export const ExpensesCategoriesManager: FC = () => {
  const dispatch = useAppDispatch();
  const {
    expensesCategories,
    total,
    options,
    fetchExpensesCategoriesRequest,
    fetchAllExpensesCategoriesRequest,
    fetchExpenseCategoryDetailsRequest,
    fetchExpensesCategoryOptionsRequest,
    createExpenseCategoryRequest,
    updateExpenseCategoryRequest,
    deleteExpenseCategoryRequest,
  } = useAppSelector((state) => state.expensesCategories);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<ExpensesCategoriesFilters>({});
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dismissedError, setDismissedError] = useState("");
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: emptyCategory,
  });
  const {
    control: filtersControl,
    handleSubmit: handleFiltersSubmit,
    reset: resetFilters,
  } = useForm<FilterFormValues>({
    resolver: zodResolver(filtersSchema),
    defaultValues: { principal: "", secundario: "", impuesto: "" },
  });

  const loadCategories = useCallback(
    (page = pageIndex, size = pageSize) => {
      dispatch(
        fetchPaginatedExpensesCategoriesThunk({
          pageSize: size,
          pageToFetch: page + 1,
          filters,
        }),
      );
    },
    [dispatch, filters, pageIndex, pageSize],
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    dispatch(fetchExpensesCategoryOptionsThunk());
  }, [dispatch]);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingCategory(null);
    reset(emptyCategory);
    dispatch(clearExpenseCategoryDetails());
    dispatch(resetExpenseCategoryMutationRequests());
  }, [dispatch, reset]);

  const refreshCategories = useCallback(
    (page = pageIndex) => {
      loadCategories(page);
      dispatch(fetchAllExpensesCategoriesThunk());
      dispatch(fetchExpensesCategoryOptionsThunk());
    },
    [dispatch, loadCategories, pageIndex],
  );

  const handleOpenCreate = useCallback(() => {
    reset(emptyCategory);
    setEditingCategory(null);
    dispatch(clearExpenseCategoryDetails());
    setIsFormOpen(true);
  }, [dispatch, reset]);

  const handleApplyFilters = useCallback((values: FilterFormValues) => {
    setFilters(toCategoryFilters(values));
    setPageIndex(0);
  }, []);

  const handleClearFilters = useCallback(() => {
    resetFilters();
    setFilters({});
    setPageIndex(0);
  }, [resetFilters]);

  const handleSubmitCategory = useCallback(
    async (body: CategoryFormValues) => {
      const action = editingCategory ? "Editar" : "Crear";

      if (!window.confirm(`¿${action} esta categoría de gasto?`)) {
        return;
      }

      const result = editingCategory
        ? await dispatch(
            updateExpenseCategoryThunk({ id: editingCategory.id, body }),
          )
        : await dispatch(createExpenseCategoryThunk(body));

      if (
        !updateExpenseCategoryThunk.fulfilled.match(result) &&
        !createExpenseCategoryThunk.fulfilled.match(result)
      ) {
        return;
      }

      closeForm();
      refreshCategories();
    },
    [closeForm, dispatch, editingCategory, refreshCategories],
  );

  const handleEdit = useCallback(
    async (category: ExpenseCategory) => {
      setEditingCategory(category);
      setIsFormOpen(true);

      const result = await dispatch(fetchExpenseCategoryDetailsThunk(category.id));

      if (!fetchExpenseCategoryDetailsThunk.fulfilled.match(result)) {
        return;
      }

      setEditingCategory(result.payload);
      reset({
        principal: result.payload.principal,
        subcategoria: result.payload.subcategoria,
        iva: result.payload.iva,
      });
      setIsFormOpen(true);
    },
    [dispatch, reset],
  );

  const handleDelete = useCallback(
    async (category: ExpenseCategory) => {
      if (!window.confirm(`¿Eliminar la categoría ${category.principal} / ${category.subcategoria}?`)) {
        return;
      }

      const result = await dispatch(deleteExpenseCategoryThunk(category.id));

      if (!deleteExpenseCategoryThunk.fulfilled.match(result)) {
        return;
      }

      const nextLastPageIndex = Math.max(
        0,
        Math.ceil(Math.max(0, total - 1) / pageSize) - 1,
      );
      const targetPageIndex = Math.min(pageIndex, nextLastPageIndex);

      setPageIndex(targetPageIndex);
      refreshCategories(targetPageIndex);
    },
    [dispatch, pageIndex, pageSize, refreshCategories, total],
  );

  const columns = useMemo<ColumnDef<ExpenseCategory>[]>(
    () => [
      {
        accessorKey: "principal",
        header: "Principal",
        cell: ({ getValue }) => <div className="max-w-48 whitespace-normal wrap-break-word">{getValue<string>()}</div>,
      },
      {
        accessorKey: "subcategoria",
        header: "Subcategoría",
        cell: ({ getValue }) => <div className="max-w-48 whitespace-normal wrap-break-word">{getValue<string>()}</div>,
      },
      {
        accessorKey: "iva",
        header: "IVA",
        cell: ({ getValue }) => `${getValue<number>()}%`,
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <ExpenseCategoryActionsMenu
            category={row.original}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      },
    ],
    [handleDelete, handleEdit],
  );

  const requestError =
    fetchExpensesCategoriesRequest.messages ||
    fetchAllExpensesCategoriesRequest.messages ||
    fetchExpenseCategoryDetailsRequest.messages ||
    fetchExpensesCategoryOptionsRequest.messages ||
    createExpenseCategoryRequest.messages ||
    updateExpenseCategoryRequest.messages ||
    deleteExpenseCategoryRequest.messages;
  const visibleError = requestError === dismissedError ? "" : requestError;
  const isSaving =
    createExpenseCategoryRequest.inProgress || updateExpenseCategoryRequest.inProgress;

  return (
    <section className="mt-12">
      {visibleError && (
        <Alert
          title="Error"
          description={visibleError}
          onClose={() => setDismissedError(visibleError)}
        />
      )}

      <h2 className="text-xl font-semibold text-gray-900">Categorías de gastos</h2>

      <form
        onSubmit={handleFiltersSubmit(handleApplyFilters)}
        noValidate
        className="mt-4 rounded-lg border border-gray-200 p-4"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            name="principal"
            control={filtersControl}
            render={({ field }) => (
              <InputField
                label="Principal"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            name="secundario"
            control={filtersControl}
            render={({ field }) => (
              <InputField
                label="Secundario"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            name="impuesto"
            control={filtersControl}
            render={({ field }) => (
              <InputField
                label="Impuesto (%)"
                name={field.name}
                type="number"
                step="0.01"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </div>
        <div className="mt-4 flex gap-3">
          <Button title="Aplicar filtros" type="submit" onClick={() => {}} />
          <Button
            title="Limpiar"
            type="button"
            variant="secondary"
            onClick={handleClearFilters}
          />
        </div>
      </form>

      <div className="mt-4">
        <Button
          title="Nueva categoría"
          onClick={handleOpenCreate}
          icon={<PlusIcon className="h-5 w-5" />}
        />
      </div>

      <Table
        data={expensesCategories}
        columns={columns}
        isLoading={fetchExpensesCategoriesRequest.inProgress}
        loadingMessage="Cargando categorías..."
        pagination={{
          pageIndex,
          pageSize,
          total,
          onPageChange: setPageIndex,
          onPageSizeChange: (nextPageSize) => {
            setPageSize(nextPageSize);
            setPageIndex(0);
          },
        }}
      />

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={isSaving ? undefined : closeForm}
            aria-hidden="true"
          />
          <form
            onSubmit={handleSubmit(handleSubmitCategory)}
            noValidate
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h3 className="text-xl font-semibold text-gray-900">
              {editingCategory ? "Editar categoría" : "Nueva categoría"}
            </h3>
            {fetchExpenseCategoryDetailsRequest.inProgress ? (
              <p className="mt-4 text-sm text-gray-500">Cargando categoría...</p>
            ) : (
              <div className="mt-4 space-y-4">
                <Controller
                  name="principal"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      label="Principal"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      list="expense-category-principals"
                      error={errors.principal?.message}
                      required
                    />
                  )}
                />
                <datalist id="expense-category-principals">
                  {options.principals.map((value) => (
                    <option key={value} value={value} />
                  ))}
                </datalist>

                <Controller
                  name="subcategoria"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      label="Subcategoría"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      list="expense-category-subcategories"
                      error={errors.subcategoria?.message}
                      required
                    />
                  )}
                />
                <datalist id="expense-category-subcategories">
                  {options.subcategories.map((value) => (
                    <option key={value} value={value} />
                  ))}
                </datalist>

                <Controller
                  name="iva"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      label="IVA (%)"
                      name={field.name}
                      type="number"
                      step="0.01"
                      value={Number.isFinite(field.value) ? field.value : ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ""
                            ? Number.NaN
                            : Number(event.target.value),
                        )
                      }
                      onBlur={field.onBlur}
                      error={errors.iva?.message}
                      required
                    />
                  )}
                />
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                title="Cancelar"
                type="button"
                variant="secondary"
                onClick={closeForm}
                disabled={isSaving}
              />
              <Button
                title={editingCategory ? "Guardar" : "Crear"}
                type="submit"
                onClick={() => {}}
                loading={isSaving}
                disabled={fetchExpenseCategoryDetailsRequest.inProgress}
              />
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
