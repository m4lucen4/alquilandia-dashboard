import { type FC } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateBudgetEventDetailsThunk } from "@/redux/actions/budgets";
import InputField from "@/components/shared/InputField";
import Button from "@/components/shared/Button";
import { CalendarPicker } from "@/components/shared/CalendarPicker";
import { PlacesAutocompleteField } from "@/components/shared/PlacesAutocompleteField";

const step2Schema = z.object({
  address: z.string().min(1, "La dirección del evento es obligatoria"),
  eventDate: z.date({ message: "La fecha del evento es obligatoria" }),
  concepto: z.string().optional(),
  comments: z.string().optional(),
  commentsalquilandia: z.string().optional(),
  location: z
    .object({ latitude: z.string(), longitude: z.string() })
    .optional(),
});

type Step2FormValues = z.infer<typeof step2Schema>;

export const BudgetStep2EventDetails: FC = () => {
  const dispatch = useAppDispatch();
  const { budgetId, updateEventDetailsRequest } = useAppSelector(
    (state) => state.budgetWizard,
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      address: "",
      eventDate: undefined,
      concepto: "",
      comments: "",
      commentsalquilandia: "",
      location: undefined,
    },
  });

  const onSubmit = (values: Step2FormValues) => {
    if (!budgetId) return;
    dispatch(
      updateBudgetEventDetailsThunk({
        budgetId,
        data: {
          address: values.address,
          eventDate: values.eventDate.toISOString(),
          concepto: values.concepto ?? "",
          comments: values.comments ?? "",
          commentsalquilandia: values.commentsalquilandia ?? "",
          ...(values.location && { location: values.location }),
        },
      }),
    );
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">
        Datos del evento
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Controller
              name="eventDate"
              control={control}
              render={({ field }) => (
                <CalendarPicker
                  label="Fecha del evento"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={errors.eventDate?.message}
                />
              )}
            />

            <div className="lg:col-span-2">
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <PlacesAutocompleteField
                    label="Dirección del evento"
                    name={field.name}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    onLocationChange={(loc) => setValue("location", loc)}
                    onBlur={field.onBlur}
                    required
                    placeholder="Escribe la dirección..."
                    error={errors.address?.message}
                  />
                )}
              />
            </div>
          </div>

          <Controller
            name="concepto"
            control={control}
            render={({ field }) => (
              <InputField
                label="Concepto"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.concepto?.message}
              />
            )}
          />

          <Controller
            name="comments"
            control={control}
            render={({ field }) => (
              <InputField
                label="Observaciones"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                as="textarea"
                rows={3}
                error={errors.comments?.message}
              />
            )}
          />

          <Controller
            name="commentsalquilandia"
            control={control}
            render={({ field }) => (
              <InputField
                label="Observaciones internas"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                as="textarea"
                rows={3}
                error={errors.commentsalquilandia?.message}
              />
            )}
          />
        </div>

        {updateEventDetailsRequest.messages && !updateEventDetailsRequest.ok && (
          <p className="mt-4 text-sm text-red-600">
            {updateEventDetailsRequest.messages}
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            title="Continuar"
            onClick={() => {}}
            variant="primary"
            type="submit"
            loading={updateEventDetailsRequest.inProgress}
          />
        </div>
      </form>
    </div>
  );
};
