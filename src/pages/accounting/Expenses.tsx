import { type FC, useCallback, useEffect, useState } from "react";
import { ArrowDownTrayIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Alert } from "@/components/shared/Alert";
import Button from "@/components/shared/Button";
import { PageHeader } from "@/components/shared/PageHeader";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { ExpensesCategoriesManager } from "@/components/expenses/ExpensesCategoriesManager";
import { ExpensesTable } from "@/components/expenses/ExpensesTable";
import {
  createExpenseThunk,
  deleteExpenseThunk,
  exportExpensesThunk,
  fetchExpenseDetailsThunk,
  fetchPaginatedExpensesThunk,
  updateExpenseThunk,
} from "@/redux/actions/expenses";
import { fetchAllExpensesCategoriesThunk } from "@/redux/actions/expensesCategories";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearExpenseDetails, resetExpenseMutationRequests } from "@/redux/slices/expensesSlice";
import type { Expense, ExpensePayload, ExpensesFilters as Filters } from "@/types/expenses";

const DEFAULT_PAGE_SIZE = 10;

export const Expenses: FC = () => {
  const dispatch = useAppDispatch();
  const { expenses, total, fetchExpensesRequest, createExpenseRequest, updateExpenseRequest, deleteExpenseRequest, exportExpensesRequest, fetchExpenseDetailsRequest } = useAppSelector((state) => state.expenses);
  const { allExpensesCategories } = useAppSelector((state) => state.expensesCategories);
  const [filters, setFilters] = useState<Filters>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [exportError, setExportError] = useState("");

  const loadExpenses = useCallback((page = pageIndex, size = pageSize) => {
    dispatch(fetchPaginatedExpensesThunk({ pageSize: size, pageToFetch: page + 1, filters }));
  }, [dispatch, filters, pageIndex, pageSize]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);
  useEffect(() => { dispatch(fetchAllExpensesCategoriesThunk()); }, [dispatch]);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
    dispatch(clearExpenseDetails());
    dispatch(resetExpenseMutationRequests());
  };

  const handleApplyFilters = (nextFilters: Filters) => {
    setFilters(nextFilters);
    setPageIndex(0);
  };

  const handleEdit = async (expense: Expense) => {
    const result = await dispatch(fetchExpenseDetailsThunk(expense.id));
    if (fetchExpenseDetailsThunk.fulfilled.match(result)) {
      setEditingExpense(result.payload);
      setIsFormOpen(true);
    }
  };

  const handleSubmit = async (body: ExpensePayload) => {
    const result = editingExpense
      ? await dispatch(updateExpenseThunk({ id: editingExpense.id, body }))
      : await dispatch(createExpenseThunk(body));
    if (updateExpenseThunk.fulfilled.match(result) || createExpenseThunk.fulfilled.match(result)) {
      closeForm();
      loadExpenses();
    }
  };

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`¿Eliminar el gasto de ${expense.proveedor}?`)) return;
    const result = await dispatch(deleteExpenseThunk(expense.id));
    if (!deleteExpenseThunk.fulfilled.match(result)) return;
    const lastPage = Math.max(0, Math.ceil(Math.max(0, total - 1) / pageSize) - 1);
    const targetPage = Math.min(pageIndex, lastPage);
    setPageIndex(targetPage);
    loadExpenses(targetPage);
  };

  const handleExport = async () => {
    setExportError("");
    const result = await dispatch(exportExpensesThunk(filters));
    if (!exportExpensesThunk.fulfilled.match(result)) return;
    try {
      const XLSX = await import("xlsx");
      const rows: Array<Record<string, string | number>> = result.payload.expenses.map((expense) => ({
        ...expense,
        Total: Number(expense.Total).toFixed(2).replace(".", ","),
        "Base Imponible": Number(expense["Base Imponible"]).toFixed(2).replace(".", ","),
      }));
      if (result.payload.provider) rows.unshift({ Proveedor: result.payload.provider });
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "sheet");
      XLSX.writeFile(workbook, `Gastos_${new Date().toISOString().slice(2, 10).replaceAll("-", "")}.xlsx`);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "No se pudo generar el Excel");
    }
  };

  const requestError = fetchExpensesRequest.messages || fetchExpenseDetailsRequest.messages || createExpenseRequest.messages || updateExpenseRequest.messages || deleteExpenseRequest.messages || exportExpensesRequest.messages || exportError;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title="Gastos" description="Gestiona los gastos de tu negocio" />
      {requestError && <Alert title="Error" description={requestError} onClose={() => { setExportError(""); dispatch(resetExpenseMutationRequests()); }} />}
      <ExpenseFilters categories={allExpensesCategories} onApply={handleApplyFilters} />
      <div className="mt-6 flex flex-wrap gap-3">
        <Button title="Nuevo gasto" onClick={() => { setEditingExpense(null); dispatch(clearExpenseDetails()); setIsFormOpen(true); }} icon={<PlusIcon className="h-5 w-5" />} />
        <Button title="Exportar tabla" variant="secondary" onClick={handleExport} loading={exportExpensesRequest.inProgress} icon={<ArrowDownTrayIcon className="h-5 w-5" />} />
      </div>
      <ExpensesTable expenses={expenses} total={total} pageIndex={pageIndex} pageSize={pageSize} isLoading={fetchExpensesRequest.inProgress} onPageChange={setPageIndex} onPageSizeChange={(size) => { setPageSize(size); setPageIndex(0); }} onEdit={handleEdit} onDelete={handleDelete} />
      <ExpensesCategoriesManager />
      <ExpenseFormModal isOpen={isFormOpen} expense={editingExpense} categories={allExpensesCategories} isSaving={createExpenseRequest.inProgress || updateExpenseRequest.inProgress} error={createExpenseRequest.messages || updateExpenseRequest.messages} onClose={closeForm} onSubmit={handleSubmit} />
    </div>
  );
};

export default Expenses;
