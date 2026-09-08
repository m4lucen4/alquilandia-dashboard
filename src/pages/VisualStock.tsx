import { type FC, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { ModalBudgetData } from "@/components/budgets/ModalBudgetData";
import { PageHeader } from "@/components/shared/PageHeader";
import { VisualStockResults } from "@/components/visualStock/VisualStockResults";
import {
  fetchVisualStockBudgetDetailsThunk,
  fetchVisualStockExtrasThunk,
  fetchVisualStockProductsThunk,
} from "@/redux/actions/visualStock";
import { getAdminAndTechniciansThunk } from "@/redux/actions/users";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearVisualStockBudgetDetails } from "@/redux/slices/visualStockSlice";
import type { Budget } from "@/types/budgets";

const visualStockRangeSchema = z
  .object({
    startDate: z.string().min(1, "La fecha inicial es obligatoria"),
    endDate: z.string().min(1, "La fecha final es obligatoria"),
  })
  .refine(({ startDate, endDate }) => endDate >= startDate, {
    message: "La fecha final debe ser posterior o igual a la inicial",
    path: ["endDate"],
  });

type VisualStockRangeFormValues = z.infer<typeof visualStockRangeSchema>;

export const VisualStock: FC = () => {
  const dispatch = useAppDispatch();
  const {
    products,
    extras,
    selectedBudget,
    productsRequest,
    extrasRequest,
    budgetDetailsRequest,
  } = useAppSelector((state) => state.visualStock);
  const technicians = useAppSelector((state) => state.users.technicians);
  const [activeTab, setActiveTab] = useState<"products" | "extras">("products");
  const [hasSearched, setHasSearched] = useState({ products: false, extras: false });
  const [searchVersion, setSearchVersion] = useState(0);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const { control, handleSubmit, formState: { errors } } = useForm<VisualStockRangeFormValues>({
    resolver: zodResolver(visualStockRangeSchema),
    defaultValues: { startDate: "", endDate: "" },
  });

  useEffect(() => {
    dispatch(getAdminAndTechniciansThunk());
  }, [dispatch]);

  const request = activeTab === "products" ? productsRequest : extrasRequest;
  const technicianName = useMemo(() => {
    if (!selectedBudget) return undefined;
    const technician = technicians.find(
      (user) => user.emailHash === selectedBudget.technicianEmailHash,
    );
    return technician ? `${technician.firstName} ${technician.lastName}`.trim() : undefined;
  }, [selectedBudget, technicians]);

  const handleSearch = ({ startDate, endDate }: VisualStockRangeFormValues): void => {
    setHasSearched((current) => ({ ...current, [activeTab]: true }));
    setSearchVersion((current) => current + 1);
    const range = { startDate, endDate };
    if (activeTab === "products") {
      dispatch(fetchVisualStockProductsThunk(range));
      return;
    }
    dispatch(fetchVisualStockExtrasThunk(range));
  };

  const handleViewBudget = (budget: Budget): void => {
    setSelectedBudgetId(budget.id);
    dispatch(fetchVisualStockBudgetDetailsThunk(budget.id));
  };

  const handleCloseBudgetDetails = (): void => {
    setSelectedBudgetId(null);
    dispatch(clearVisualStockBudgetDetails());
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title="Stock visual" description="Consulta de artículos y extras por rango de fechas" />
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex gap-2 border-b border-gray-200" role="tablist" aria-label="Tipo de stock">
          {(["products", "extras"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-2 text-sm font-medium ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {tab === "products" ? "Productos" : "Extras"}
            </button>
          ))}
        </div>
        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handleSubmit(handleSearch)} noValidate>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <label className="block text-sm font-medium text-gray-700">
                Desde
                <input {...field} type="date" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
                {errors.startDate && <span className="mt-1 block text-sm text-red-600">{errors.startDate.message}</span>}
              </label>
            )}
          />
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <label className="block text-sm font-medium text-gray-700">
                Hasta
                <input {...field} type="date" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
                {errors.endDate && <span className="mt-1 block text-sm text-red-600">{errors.endDate.message}</span>}
              </label>
            )}
          />
          <div className="flex items-end">
            <Button title="Aplicar" onClick={() => {}} type="submit" loading={request.inProgress} />
          </div>
        </form>
        {request.messages && !request.inProgress && !request.ok && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{request.messages}</p>
        )}
        <div className="mt-6" role="tabpanel">
          <VisualStockResults
            tab={activeTab}
            products={products}
            extras={extras}
              isLoading={request.inProgress}
              hasSearched={hasSearched[activeTab]}
              resetKey={searchVersion}
              onViewBudget={handleViewBudget}
          />
        </div>
      </div>
      {selectedBudgetId && budgetDetailsRequest.inProgress && (
        <Modal title="Detalle del presupuesto" onAccept={handleCloseBudgetDetails} onClose={handleCloseBudgetDetails} acceptText="Cerrar" cancelText="">
          <p>Cargando detalle del presupuesto…</p>
        </Modal>
      )}
      {selectedBudgetId && budgetDetailsRequest.messages && !budgetDetailsRequest.inProgress && !selectedBudget && (
        <Modal title="Detalle del presupuesto" onAccept={handleCloseBudgetDetails} onClose={handleCloseBudgetDetails} acceptText="Cerrar" cancelText="">
          <p role="alert">{budgetDetailsRequest.messages}</p>
        </Modal>
      )}
      <ModalBudgetData
        isOpen={Boolean(selectedBudgetId && selectedBudget)}
        budget={selectedBudget}
        user={selectedBudget?.user ?? null}
        technicianName={technicianName}
        hideButtons
        onClose={handleCloseBudgetDetails}
      />
    </div>
  );
};
