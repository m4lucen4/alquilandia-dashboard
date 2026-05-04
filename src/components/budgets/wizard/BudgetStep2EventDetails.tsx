import { type FC, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateBudgetEventDetailsThunk } from "@/redux/actions/budgets";
import { fetchAllWarehouses } from "@/redux/actions/warehouses";
import InputField from "@/components/shared/InputField";
import Button from "@/components/shared/Button";
import { CalendarPicker } from "@/components/shared/CalendarPicker";
import { PlacesAutocompleteField } from "@/components/shared/PlacesAutocompleteField";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const step2Schema = z.object({
  address: z.string().min(1, "La dirección del evento es obligatoria"),
  eventDate: z.date({ message: "La fecha del evento es obligatoria" }),
  concepto: z.string().optional(),
  comments: z.string().optional(),
  commentsalquilandia: z.string().optional(),
  location: z
    .object({ latitude: z.string(), longitude: z.string() })
    .optional(),
  distance: z.string().optional(),
});

type Step2FormValues = z.infer<typeof step2Schema>;

function toEventDate(iso: string): Date | undefined {
  if (!iso || iso.startsWith("0001-")) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export const BudgetStep2EventDetails: FC = () => {
  const dispatch = useAppDispatch();
  const { budgetId, budget, updateEventDetailsRequest } = useAppSelector(
    (state) => state.budgetWizard,
  );
  const warehouses = useAppSelector((state) => state.warehouses.warehouses);

  useEffect(() => {
    dispatch(fetchAllWarehouses());
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      address: budget?.address ?? "",
      eventDate: budget?.eventDate ? toEventDate(budget.eventDate) : undefined,
      concepto: budget?.concepto ?? "",
      comments: budget?.comments ?? "",
      commentsalquilandia: budget?.commentsalquilandia ?? "",
      location:
        budget?.location?.latitude
          ? budget.location
          : undefined,
      distance: budget?.distance || undefined,
    },
  });

  const distance = watch("distance");

  const handleLocationChange = (loc: { latitude: string; longitude: string }) => {
    setValue("location", loc);
    const mileageWarehouses = warehouses.filter((w) => w.use_for_mileage);
    if (mileageWarehouses.length === 0) return;

    const eventLat = Number.parseFloat(loc.latitude);
    const eventLon = Number.parseFloat(loc.longitude);
    const minKm = Math.min(
      ...mileageWarehouses.map((w) =>
        haversineKm(w.latitude, w.longitude, eventLat, eventLon),
      ),
    );
    const formatted =
      minKm.toLocaleString("es-ES", { maximumFractionDigits: 1 }) + " km";
    setValue("distance", formatted);
  };

  const onSubmit = (values: Step2FormValues) => {
    if (!budgetId || !budget) return;
    dispatch(
      updateBudgetEventDetailsThunk({
        budgetId,
        data: {
          ...budget,
          address: values.address,
          eventDate: values.eventDate.toISOString(),
          concepto: values.concepto ?? "",
          comments: values.comments ?? "",
          commentsalquilandia: values.commentsalquilandia ?? "",
          location: values.location ?? budget.location,
          distance: values.distance ?? budget.distance ?? "",
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

            <div className="space-y-3 lg:col-span-2">
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <PlacesAutocompleteField
                    label="Dirección del evento"
                    name={field.name}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    onLocationChange={handleLocationChange}
                    onBlur={field.onBlur}
                    required
                    placeholder="Escribe la dirección..."
                    error={errors.address?.message}
                  />
                )}
              />

              {distance && (
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  <span className="font-medium">Distancia al almacén más cercano:</span>
                  <span className="font-bold">{distance}</span>
                </div>
              )}
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
