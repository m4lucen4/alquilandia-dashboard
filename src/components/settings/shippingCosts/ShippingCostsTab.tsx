import { type FC, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "@/components/shared/InputField";
import Button from "@/components/shared/Button";
import { Alert } from "@/components/shared/Alert";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchShippingCosts, updateShippingCosts } from "@/redux/actions/shippingCosts";
import {
  clearUpdateShippingCostsSuccess,
  clearShippingCostsErrors,
} from "@/redux/slices/shippingCostsSlice";

const schema = z.object({
  fixedPriceBlockZero: z.number().min(0, "Debe ser mayor o igual a 0"),
  fixedPriceBlockNotZero: z.number().min(0, "Debe ser mayor o igual a 0"),
  distanceVarBlockZero: z.number().min(0, "Debe ser mayor o igual a 0"),
  distanceVarBlockNotZero: z.number().min(0, "Debe ser mayor o igual a 0"),
});

type ShippingCostFormValues = z.infer<typeof schema>;

export const ShippingCostsTab: FC = () => {
  const dispatch = useAppDispatch();
  const { shippingCosts, fetchShippingCostsRequest, updateShippingCostsRequest } =
    useAppSelector((state) => state.shippingCosts);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShippingCostFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fixedPriceBlockZero: 0,
      fixedPriceBlockNotZero: 0,
      distanceVarBlockZero: 0,
      distanceVarBlockNotZero: 0,
    },
  });

  useEffect(() => {
    dispatch(fetchShippingCosts());
  }, [dispatch]);

  useEffect(() => {
    if (shippingCosts) {
      reset({
        fixedPriceBlockZero: shippingCosts.fixedPriceBlockZero,
        fixedPriceBlockNotZero: shippingCosts.fixedPriceBlockNotZero,
        distanceVarBlockZero: shippingCosts.distanceVarBlockZero,
        distanceVarBlockNotZero: shippingCosts.distanceVarBlockNotZero,
      });
    }
  }, [shippingCosts, reset]);

  useEffect(() => {
    if (updateShippingCostsRequest.ok && !updateShippingCostsRequest.inProgress) {
      setTimeout(() => dispatch(clearUpdateShippingCostsSuccess()), 3000);
    }
  }, [updateShippingCostsRequest, dispatch]);

  const onSubmit = (values: ShippingCostFormValues) => {
    if (!shippingCosts) return;
    const id = shippingCosts._id ?? (shippingCosts as unknown as { id: string }).id;
    dispatch(updateShippingCosts({ id, data: values }));
  };

  const isLoading = fetchShippingCostsRequest.inProgress;
  const isSaving = updateShippingCostsRequest.inProgress;

  const errorMessage =
    (!fetchShippingCostsRequest.ok && fetchShippingCostsRequest.messages) ||
    (!updateShippingCostsRequest.ok && updateShippingCostsRequest.messages) ||
    null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="ml-3 text-sm text-gray-500">Cargando...</span>
      </div>
    );
  }

  return (
    <>
      {updateShippingCostsRequest.ok && (
        <Alert
          title="Guardado correctamente"
          description={updateShippingCostsRequest.messages}
          onClose={() => dispatch(clearUpdateShippingCostsSuccess())}
        />
      )}

      {errorMessage && (
        <Alert
          title="Error"
          description={errorMessage}
          onClose={() => dispatch(clearShippingCostsErrors())}
        />
      )}

    <div className="max-w-2xl">
      <p className="mb-6 text-sm text-gray-500">
        Configura los parámetros de cálculo para los gastos de envío.
      </p>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Precio fijo
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="fixedPriceBlockZero"
              control={control}
              render={({ field }) => (
                <InputField
                  label="Importe fijo para artículos de bloqueo 0"
                  name={field.name}
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                  error={errors.fixedPriceBlockZero?.message}
                  disabled={isSaving}
                />
              )}
            />
            <Controller
              name="fixedPriceBlockNotZero"
              control={control}
              render={({ field }) => (
                <InputField
                  label="Importe fijo para artículos distintos de bloqueo 0"
                  name={field.name}
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                  error={errors.fixedPriceBlockNotZero?.message}
                  disabled={isSaving}
                />
              )}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Variable por distancia
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="distanceVarBlockZero"
              control={control}
              render={({ field }) => (
                <InputField
                  label="Variable para kilometraje de artículos de bloqueo 0"
                  name={field.name}
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                  error={errors.distanceVarBlockZero?.message}
                  disabled={isSaving}
                />
              )}
            />
            <Controller
              name="distanceVarBlockNotZero"
              control={control}
              render={({ field }) => (
                <InputField
                  label="Variable para kilometraje de artículos de bloqueo distinto de 0"
                  name={field.name}
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                  error={errors.distanceVarBlockNotZero?.message}
                  disabled={isSaving}
                />
              )}
            />
          </div>
        </div>


        <div>
          <Button
            title="Guardar cambios"
            onClick={() => void handleSubmit(onSubmit)()}
            disabled={isSaving || !shippingCosts}
          />
        </div>
      </form>
    </div>
    </>
  );
};
