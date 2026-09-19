import { type FC, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/shared/Button";
import InputField from "@/components/shared/InputField";
import SelectField from "@/components/shared/SelectField";
import type { ExpensesFilters as Filters } from "@/types/expenses";
import type { ExpenseCategory } from "@/types/expensesCategories";

const filtersSchema = z.object({ proveedor: z.string(), principal: z.string(), secundario: z.string(), impuesto: z.string(), baseImponible: z.string(), total: z.string(), dateFrom: z.string(), dateTo: z.string() });
type FilterValues = z.infer<typeof filtersSchema>;
interface Props { categories: ExpenseCategory[]; onApply: (filters: Filters) => void; }

export const ExpenseFilters: FC<Props> = ({ categories, onApply }) => {
  const { control, handleSubmit, reset, watch, setValue } = useForm<FilterValues>({ resolver: zodResolver(filtersSchema), defaultValues: { proveedor: "", principal: "", secundario: "", impuesto: "", baseImponible: "", total: "", dateFrom: "", dateTo: "" } });
  const principal = watch("principal");
  useEffect(() => { setValue("secundario", ""); }, [principal, setValue]);
  const principals = [...new Set(categories.map((category) => category.principal))].map((value) => ({ value, label: value }));
  const secondaries = categories.filter((category) => category.principal === principal).map((category) => ({ value: category.subcategoria, label: category.subcategoria }));
  const submit = (values: FilterValues) => onApply(Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "").map(([key, value]) => [key, ["impuesto", "baseImponible", "total"].includes(key) ? Number(value) : key.startsWith("date") ? new Date(`${value}T00:00:00.000Z`).toISOString() : value])) as Filters);
  return <form onSubmit={handleSubmit(submit)} noValidate className="mt-6 rounded-lg border border-gray-200 p-4"><div className="grid gap-4 md:grid-cols-4"><Controller name="proveedor" control={control} render={({ field }) => <InputField label="Proveedor" name={field.name} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />} /><Controller name="principal" control={control} render={({ field }) => <SelectField label="Principal" name={field.name} value={field.value} onChange={field.onChange} options={principals} placeholder="Todos" />} /><Controller name="secundario" control={control} render={({ field }) => <SelectField label="Secundario" name={field.name} value={field.value} onChange={field.onChange} options={secondaries} placeholder="Todos" disabled={!principal} />} /><Controller name="impuesto" control={control} render={({ field }) => <InputField label="Impuesto (%)" name={field.name} type="number" value={field.value} onChange={field.onChange} onBlur={field.onBlur} />} /><Controller name="baseImponible" control={control} render={({ field }) => <InputField label="Base imponible" name={field.name} type="number" value={field.value} onChange={field.onChange} onBlur={field.onBlur} />} /><Controller name="total" control={control} render={({ field }) => <InputField label="Total" name={field.name} type="number" value={field.value} onChange={field.onChange} onBlur={field.onBlur} />} /><Controller name="dateFrom" control={control} render={({ field }) => <InputField label="Fecha desde" name={field.name} type="date" value={field.value} onChange={field.onChange} onBlur={field.onBlur} />} /><Controller name="dateTo" control={control} render={({ field }) => <InputField label="Fecha hasta" name={field.name} type="date" value={field.value} onChange={field.onChange} onBlur={field.onBlur} />} /></div><div className="mt-4 flex gap-3"><Button title="Aplicar filtros" type="submit" onClick={() => {}} /><Button title="Limpiar" type="button" variant="secondary" onClick={() => { reset(); onApply({}); }} /></div></form>;
};
