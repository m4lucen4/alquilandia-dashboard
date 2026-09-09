import { type FC, useEffect, useMemo, useRef, useState } from "react";
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
import {
  calculateDrivingMileage,
  type EventLocation,
} from "./BudgetStep2EventDetails.utils";
import { loadGoogleMaps } from "@/components/shared/googleMaps";

type MileageStatus = "idle" | "loading" | "resolved" | "error" | "unavailable";

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
  pickupInWarehouse: z.boolean().optional(),
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
  const { warehouses, fetchWarehousesRequest } = useAppSelector(
    (state) => state.warehouses,
  );
  const [mileageStatus, setMileageStatus] = useState<MileageStatus>("idle");
  const [mileageError, setMileageError] = useState("");
  const routeRequestIdRef = useRef(0);

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
      pickupInWarehouse: budget?.nosend ?? false,
    },
  });

  const distance = watch("distance");
  const pickupInWarehouse = watch("pickupInWarehouse");
  const location = watch("location");
  const mileageWarehouses = useMemo(
    () => warehouses.filter((warehouse) => warehouse.use_for_mileage),
    [warehouses],
  );

  const invalidateMileage = () => {
    routeRequestIdRef.current += 1;
    setValue("location", undefined);
    setValue("distance", undefined);
    setMileageStatus("idle");
    setMileageError("");
  };

  const handleLocationChange = (loc: EventLocation) => {
    routeRequestIdRef.current += 1;
    setValue("location", loc);
    setValue("distance", undefined);
    setMileageStatus("loading");
    setMileageError("");
  };

  useEffect(() => {
    const requestId = routeRequestIdRef.current + 1;
    routeRequestIdRef.current = requestId;
    const clearMileage = () => setValue("distance", undefined);

    if (pickupInWarehouse) {
      setMileageStatus("idle");
      setMileageError("");
    } else if (!location) {
      clearMileage();
      setMileageStatus("idle");
      setMileageError("Selecciona una dirección del autocompletado para calcular la distancia por carretera.");
    } else if (fetchWarehousesRequest.inProgress) {
      clearMileage();
      setMileageStatus("loading");
      setMileageError("");
    } else if (!fetchWarehousesRequest.ok) {
      clearMileage();
      setMileageStatus("error");
      setMileageError("No se han podido cargar los almacenes para calcular el kilometraje.");
    } else if (mileageWarehouses.length === 0) {
      clearMileage();
      setMileageStatus("unavailable");
      setMileageError("No hay almacenes habilitados para calcular el kilometraje.");
    } else {
      clearMileage();
      setMileageStatus("loading");
      setMileageError("");

      const calculateMileage = async () => {
        try {
          await loadGoogleMaps();
          const { Route } = await google.maps.importLibrary("routes");
          const calculatedDistance = await calculateDrivingMileage(
            Route,
            location,
            mileageWarehouses,
          );

          if (routeRequestIdRef.current !== requestId) return;
          setValue("distance", calculatedDistance);
          setMileageStatus("resolved");
        } catch {
          if (routeRequestIdRef.current !== requestId) return;
          clearMileage();
          setMileageStatus("error");
          setMileageError("No se ha podido calcular la distancia por carretera. Selecciona otra dirección o inténtalo de nuevo.");
        }
      };

      void calculateMileage();
    }

    return () => {
      if (routeRequestIdRef.current === requestId) {
        routeRequestIdRef.current += 1;
      }
    };
  }, [
    fetchWarehousesRequest.inProgress,
    fetchWarehousesRequest.ok,
    location,
    mileageWarehouses,
    pickupInWarehouse,
    setValue,
  ]);

  const onSubmit = (values: Step2FormValues) => {
    if (!budgetId || !budget) return;
    if (
      !values.pickupInWarehouse &&
      (mileageStatus !== "resolved" || !values.location || !values.distance)
    ) {
      return;
    }
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
          distance: values.pickupInWarehouse ? "0" : (values.distance ?? ""),
          nosend: values.pickupInWarehouse ?? false,
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
                    onManualInput={invalidateMileage}
                    onLocationChange={handleLocationChange}
                    onBlur={field.onBlur}
                    required
                    placeholder="Escribe la dirección..."
                    error={errors.address?.message}
                  />
                )}
              />

              {distance && !pickupInWarehouse && (
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  <span className="font-medium">Distancia al almacén más cercano:</span>
                  <span className="font-bold">{distance}</span>
                </div>
              )}
              {!pickupInWarehouse && mileageStatus === "loading" && (
                <p className="text-sm text-blue-700" role="status">
                  Calculando distancia por carretera...
                </p>
              )}
              {!pickupInWarehouse && mileageError && (
                <p className="text-sm text-red-600" role="alert">
                  {mileageError}
                </p>
              )}
            </div>
          </div>

          <Controller
            name="pickupInWarehouse"
            control={control}
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 accent-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Los artículos se recogen en almacén
                </span>
              </label>
            )}
          />

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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
            disabled={!pickupInWarehouse && mileageStatus !== "resolved"}
          />
        </div>
      </form>
    </div>
  );
};
