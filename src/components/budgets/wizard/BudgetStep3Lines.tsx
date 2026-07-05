import { type FC, useEffect, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchBudgetCatalogThunk,
  fetchCatalogStockThunk,
  updateBudgetLinesThunk,
} from "@/redux/actions/budgets";
import { fetchInventoryCategories } from "@/redux/actions/inventoryCategories";
import { fetchDiscountsThunk } from "@/redux/actions/discounts";
import { upsertBudgetLine, removeBudgetLine, setBudgetLineUnits } from "@/helpers/budgetLines";
import type { Inventory } from "@/types/inventory";
import type { BudgetLine } from "@/types/budgets";
import type { ProductCardFormValues } from "./step3/ProductCard";
import { Alert } from "@/components/shared/Alert";
import { Pagination } from "@/components/shared/Pagination";
import { CatalogFilters } from "./step3/CatalogFilters";
import { ProductCard } from "./step3/ProductCard";
import { CartSummary } from "./step3/CartSummary";

const PAGE_SIZE = 9;

export const BudgetStep3Lines: FC = () => {
  const dispatch = useAppDispatch();

  const { budget, budgetId, catalogProducts, catalogTotal, catalogPage, catalogFiltersQuery,
    stockByProductId, fetchCatalogRequest, updateLinesRequest } =
    useAppSelector((state) => state.budgetWizard);
  const { inventoryCategoriesList } = useAppSelector((state) => state.inventoryCategories);
  const { discounts } = useAppSelector((state) => state.discounts);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [cartOpen, setCartOpen] = useState(false);
  // true desde el inicio si ya había productos cargados (vuelta desde step 4)
  const [hasSearched, setHasSearched] = useState(() => catalogProducts.length > 0);

  const showDiscount =
    currentUser?.role === "ADMIN" || currentUser?.role === "TECHNICIAN";

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (inventoryCategoriesList.length === 0) dispatch(fetchInventoryCategories());
    if (discounts.length === 0) dispatch(fetchDiscountsThunk());
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stock batch al cambiar página/catálogo ─────────────────────────────────
  useEffect(() => {
    if (catalogProducts.length > 0 && budgetId) {
      dispatch(
        fetchCatalogStockThunk({
          budgetId,
          productIds: catalogProducts.map((p) => p.id),
        }),
      );
    }
  }, [catalogProducts, budgetId, dispatch]);

  // ── Disponibilidad derivada ────────────────────────────────────────────────
  const getAvailableUnits = useCallback(
    (product: Inventory): number => {
      const blocked = stockByProductId[product.id] ?? 0;
      const inCart =
        budget?.budgetLines?.find((l) => l.id === product.id)?.units ?? 0;
      return product.unidades - blocked - inCart;
    },
    [stockByProductId, budget?.budgetLines],
  );

  const getMaxUnitsForLine = useCallback(
    (line: BudgetLine): number => {
      const blocked = stockByProductId[line.id] ?? 0;
      return line.unidades - blocked;
    },
    [stockByProductId],
  );

  // ── Handlers de carrito ────────────────────────────────────────────────────
  const handleAdd = useCallback(
    (product: Inventory, values: ProductCardFormValues) => {
      if (!budget || !budgetId) return;
      const newBudget = upsertBudgetLine(budget, product, {
        unitsToAdd: values.units,
        descuento: values.descuento,
        extras: values.extras,
      });
      dispatch(updateBudgetLinesThunk({ budgetId, data: newBudget }));
    },
    [budget, budgetId, dispatch],
  );

  const handleRemoveLine = useCallback(
    (lineId: string) => {
      if (!budget || !budgetId) return;
      const newBudget = removeBudgetLine(budget, lineId);
      dispatch(updateBudgetLinesThunk({ budgetId, data: newBudget }));
    },
    [budget, budgetId, dispatch],
  );

  const handleUpdateUnits = useCallback(
    (lineId: string, units: number) => {
      if (!budget || !budgetId) return;
      const newBudget = setBudgetLineUnits(budget, lineId, units);
      dispatch(updateBudgetLinesThunk({ budgetId, data: newBudget }));
    },
    [budget, budgetId, dispatch],
  );

  // ── Filtros y paginación ───────────────────────────────────────────────────
  const handleSearch = useCallback(
    (filtersQuery: string) => {
      if (!budgetId) return;
      setHasSearched(true);
      dispatch(
        fetchBudgetCatalogThunk({ budgetId, pageSize: PAGE_SIZE, pageToFetch: 1, filtersQuery }),
      );
    },
    [budgetId, dispatch],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (!budgetId) return;
      dispatch(
        fetchBudgetCatalogThunk({
          budgetId,
          pageSize: PAGE_SIZE,
          pageToFetch: page + 1,
          filtersQuery: catalogFiltersQuery,
        }),
      );
    },
    [budgetId, catalogFiltersQuery, dispatch],
  );

  const totalPages = Math.ceil(catalogTotal / PAGE_SIZE);
  const isSaving = updateLinesRequest.inProgress;
  const lineCount = budget?.budgetLines?.length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Errores */}
      {fetchCatalogRequest.messages && (
        <Alert title="Error al cargar el catálogo" description={fetchCatalogRequest.messages} />
      )}
      {updateLinesRequest.messages && (
        <Alert title="Error al guardar" description={updateLinesRequest.messages} />
      )}

      {/* Filtros */}
      <CatalogFilters
        categories={inventoryCategoriesList}
        isLoading={fetchCatalogRequest.inProgress}
        onSearch={handleSearch}
      />

      {/* Grid catálogo — siempre 4 columnas */}
      <div className="flex flex-col gap-4">
        {!hasSearched ? (
          <div className="flex h-40 items-center justify-center rounded-2xl bg-white shadow-sm">
            <p className="text-sm text-gray-400">Usa los filtros para buscar artículos.</p>
          </div>
        ) : fetchCatalogRequest.inProgress && catalogProducts.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-2xl bg-white shadow-sm">
            <p className="text-sm text-gray-400">Cargando catálogo...</p>
          </div>
        ) : catalogProducts.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-2xl bg-white shadow-sm">
            <p className="text-sm text-gray-400">No se encontraron productos.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {catalogProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                availableUnits={getAvailableUnits(product)}
                eventDate={budget?.eventDate ?? ""}
                discounts={discounts}
                showDiscount={showDiscount}
                isSaving={isSaving}
                onAdd={handleAdd}
              />
            ))}
          </div>
        )}

        {hasSearched && totalPages > 1 && (
          <Pagination
            currentPage={catalogPage - 1}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalItems={catalogTotal}
            onPageChange={handlePageChange}
            onPageSizeChange={() => undefined}
            canPreviousPage={catalogPage > 1}
            canNextPage={catalogPage < totalPages}
          />
        )}
      </div>

      {/* Mobile: carrito debajo del catálogo */}
      {budget && (
        <div className="lg:hidden">
          <CartSummary
            budget={budget}
            isSaving={isSaving}
            onUpdateUnits={handleUpdateUnits}
            onRemoveLine={handleRemoveLine}
            getMaxUnits={getMaxUnitsForLine}
          />
        </div>
      )}

      {/* Desktop: botón toggle fijo en el borde derecho */}
      {!cartOpen && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label="Ver carrito"
          className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-1.5 rounded-l-2xl bg-white py-4 px-3 shadow-lg border border-r-0 border-gray-200 hover:bg-gray-50 text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          {lineCount > 0 && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {lineCount}
            </span>
          )}
          <svg className="h-3 w-3 -rotate-90 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
      )}

      {/* Desktop: drawer del carrito fijo a la derecha */}
      {cartOpen && budget && (
        <div className="hidden lg:flex fixed top-0 right-0 bottom-0 z-40 w-80 flex-col bg-white shadow-2xl border-l border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 shrink-0">
            <span className="text-sm font-semibold text-gray-800">Carrito ({lineCount})</span>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              aria-label="Cerrar carrito"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <CartSummary
              budget={budget}
              isSaving={isSaving}
              onUpdateUnits={handleUpdateUnits}
              onRemoveLine={handleRemoveLine}
              getMaxUnits={getMaxUnitsForLine}
            />
          </div>
        </div>
      )}

    </div>
  );
};
