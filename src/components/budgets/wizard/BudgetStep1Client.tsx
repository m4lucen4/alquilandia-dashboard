import { type FC, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { createBudgetThunk } from "@/redux/actions/budgets";
import { clearCreateBudgetError } from "@/redux/slices/budgetWizardSlice";
import type { BudgetError } from "@/types/budgets";
import InputField from "@/components/shared/InputField";
import Button from "@/components/shared/Button";

const companySchema = z.object({
  name: z.string().optional(),
  nif: z.string().optional(),
  address: z.string().optional(),
  population: z.string().optional(),
  locality: z.string().optional(),
  zipCode: z.string().optional(),
});

const step1Schema = z.object({
  firstName: z.string().min(1, "Obligatorio"),
  lastName: z.string().min(1, "Obligatorio"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Obligatorio"),
  phone2: z.string().optional(),
  dnif: z.string().min(1, "Obligatorio"),
  address: z.string().optional(),
  population: z.string().optional(),
  locality: z.string().optional(),
  zipCode: z.string().optional(),
  company: companySchema.optional(),
});

type Step1FormValues = z.infer<typeof step1Schema>;

const emptyCompany = {
  name: "",
  nif: "",
  address: "",
  population: "",
  locality: "",
  zipCode: "",
};

export const BudgetStep1Client: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { prefillData, createBudgetRequest } = useAppSelector(
    (state) => state.budgetWizard,
  );

  const [showUserExistsModal, setShowUserExistsModal] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: prefillData
      ? {
          firstName: prefillData.firstName,
          lastName: prefillData.lastName,
          email: prefillData.email,
          phone: prefillData.phone,
          phone2: prefillData.phone2 ?? "",
          dnif: prefillData.dnif,
          address: prefillData.address ?? "",
          population: prefillData.population ?? "",
          locality: prefillData.locality ?? "",
          zipCode: prefillData.zipCode ?? "",
          company: prefillData.company ?? emptyCompany,
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          phone2: "",
          dnif: "",
          address: "",
          population: "",
          locality: "",
          zipCode: "",
          company: emptyCompany,
        },
  });

  const onSubmit = async (values: Step1FormValues) => {
    dispatch(clearCreateBudgetError());
    const { company, ...rest } = values;
    const userData: Record<string, unknown> = {
      ...rest,
      role: "CLIENT",
      company:
        company && Object.values(company).some(Boolean) ? company : null,
    };

    const result = await dispatch(createBudgetThunk({ data: userData }));

    if (createBudgetThunk.rejected.match(result)) {
      const error = result.payload as BudgetError;
      if (
        error?.code === "USER_ALREADY_EXISTS" ||
        error?.code === "USER_IS_PROBLEMATIC"
      ) {
        setShowUserExistsModal(true);
      }
    }
  };

  return (
    <>
      {showUserExistsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowUserExistsModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="p-6 sm:p-8">
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Usuario ya existente
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Este usuario ya existe, vaya a la tabla de usuarios y genere el presupuesto.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:px-8">
              <Button
                title="Cancelar"
                onClick={() => setShowUserExistsModal(false)}
                variant="secondary"
                type="button"
              />
              <Button
                title="Ir a usuarios"
                onClick={() => navigate("/users")}
                variant="primary"
                type="button"
              />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Datos del cliente
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="Nombre"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    required
                    error={errors.firstName?.message}
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="Apellidos"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    required
                    error={errors.lastName?.message}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="Email"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    type="email"
                    required
                    error={errors.email?.message}
                  />
                )}
              />
              <Controller
                name="dnif"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="DNI"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    required
                    error={errors.dnif?.message}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="Teléfono"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    required
                    error={errors.phone?.message}
                  />
                )}
              />
              <Controller
                name="phone2"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="Teléfono 2"
                    name={field.name}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.phone2?.message}
                  />
                )}
              />
            </div>

            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <InputField
                  label="Dirección"
                  name={field.name}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.address?.message}
                />
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Controller
                name="population"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="Provincia"
                    name={field.name}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.population?.message}
                  />
                )}
              />
              <Controller
                name="locality"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="Localidad"
                    name={field.name}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.locality?.message}
                  />
                )}
              />
              <Controller
                name="zipCode"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="Código postal"
                    name={field.name}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.zipCode?.message}
                  />
                )}
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-700">
                Datos de empresa (opcional)
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name="company.name"
                    control={control}
                    render={({ field }) => (
                      <InputField
                        label="Nombre empresa"
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.company?.name?.message}
                      />
                    )}
                  />
                  <Controller
                    name="company.nif"
                    control={control}
                    render={({ field }) => (
                      <InputField
                        label="NIF"
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.company?.nif?.message}
                      />
                    )}
                  />
                </div>
                <Controller
                  name="company.address"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      label="Dirección empresa"
                      name={field.name}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.company?.address?.message}
                    />
                  )}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Controller
                    name="company.population"
                    control={control}
                    render={({ field }) => (
                      <InputField
                        label="Provincia"
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.company?.population?.message}
                      />
                    )}
                  />
                  <Controller
                    name="company.locality"
                    control={control}
                    render={({ field }) => (
                      <InputField
                        label="Localidad"
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.company?.locality?.message}
                      />
                    )}
                  />
                  <Controller
                    name="company.zipCode"
                    control={control}
                    render={({ field }) => (
                      <InputField
                        label="Código postal"
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.company?.zipCode?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {createBudgetRequest.messages && !createBudgetRequest.ok && (
            <p className="mt-4 text-sm text-red-600">
              {createBudgetRequest.messages}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              title="Continuar"
              onClick={() => {}}
              variant="primary"
              type="submit"
              loading={createBudgetRequest.inProgress}
            />
          </div>
        </form>
      </div>
    </>
  );
};
