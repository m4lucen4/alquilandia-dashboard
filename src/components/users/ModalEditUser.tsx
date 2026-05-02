import { type FC, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "@/components/shared/InputField";
import SelectField from "@/components/shared/SelectField";
import Button from "@/components/shared/Button";
import type { User } from "@/types/budgets";
import { ROLE_OPTIONS } from "@/constants";

const companySchema = z.object({
  name: z.string().optional(),
  nif: z.string().optional(),
  address: z.string().optional(),
  population: z.string().optional(),
  locality: z.string().optional(),
  zipCode: z.string().optional(),
});

const editUserSchema = z.object({
  role: z.string().min(1, "Selecciona un rol"),
  discount: z.number().min(0, "Debe ser ≥ 0"),
  firstName: z.string().min(1, "Obligatorio"),
  lastName: z.string().min(1, "Obligatorio"),
  address: z.string().optional(),
  population: z.string().optional(),
  locality: z.string().optional(),
  zipCode: z.string().optional(),
  dnif: z.string().min(1, "Obligatorio"),
  phone: z.string().min(1, "Obligatorio"),
  phone2: z.string().optional(),
  email: z.string().email("Email inválido"),
  problematic: z.boolean(),
  company: companySchema.optional(),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;

interface ModalEditUserProps {
  isOpen: boolean;
  isEditing: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (data: EditUserFormValues) => void;
}

export const ModalEditUser: FC<ModalEditUserProps> = ({
  isOpen,
  isEditing,
  user,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      role: "",
      discount: 0,
      firstName: "",
      lastName: "",
      address: "",
      population: "",
      locality: "",
      zipCode: "",
      dnif: "",
      phone: "",
      phone2: "",
      email: "",
      problematic: false,
      company: {
        name: "",
        nif: "",
        address: "",
        population: "",
        locality: "",
        zipCode: "",
      },
    },
  });

  useEffect(() => {
    if (isOpen && user) {
      reset({
        role: user.role ?? "",
        discount: user.discount ?? 0,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        address: user.address ?? "",
        population: user.population ?? "",
        locality: user.locality ?? "",
        zipCode: user.zipCode ?? "",
        dnif: user.dnif ?? "",
        phone: user.phone ?? "",
        phone2: user.phone2 ?? "",
        email: user.email ?? "",
        problematic: user.problematic ?? false,
        company: {
          name: user.company?.name ?? "",
          nif: user.company?.nif ?? "",
          address: user.company?.address ?? "",
          population: user.company?.population ?? "",
          locality: user.company?.locality ?? "",
          zipCode: user.company?.zipCode ?? "",
        },
      });
    }
  }, [isOpen, user, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-labelledby="modal-edit-user-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Cerrar modal"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="p-6 sm:p-8">
            <h3
              id="modal-edit-user-title"
              className="mb-6 text-xl font-semibold text-gray-900"
            >
              Editar usuario
            </h3>

            <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Rol"
                      name={field.name}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      options={ROLE_OPTIONS}
                      placeholder="Selecciona un rol"
                      required
                      error={errors.role?.message}
                    />
                  )}
                />

                <Controller
                  name="discount"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      label="Descuento (%)"
                      name={field.name}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onBlur={field.onBlur}
                      type="number"
                      error={errors.discount?.message}
                    />
                  )}
                />
              </div>

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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                name="problematic"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <input
                      id="input-edit-problematic"
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="input-edit-problematic"
                      className="text-sm font-medium text-gray-900"
                    >
                      Usuario con incidencias
                    </label>
                  </div>
                )}
              />

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
          </div>

          <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 sm:px-8">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                title="Cancelar"
                onClick={onClose}
                variant="secondary"
                type="button"
              />
              <Button
                title="Guardar cambios"
                onClick={() => {}}
                variant="primary"
                type="submit"
                loading={isEditing}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
