import { type FC, useEffect, useMemo, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useParams, useSearchParams } from "react-router-dom";
import { FinalPaymentForm } from "@/components/budgets/FinalPaymentForm";
import { formatDate } from "@/helpers/dates";
import {
  calculateFinalPaymentAmount,
  isFinalPaymentEligible,
} from "@/helpers/budgetFinalPayment";
import { getBudgetFinalDetails, getStripeFinalSecret } from "@/services/budgetsServices";
import type { Budget } from "@/types/budgets";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export const FinalBudgetPayment: FC = () => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const [searchParams] = useSearchParams();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestingPayment, setIsRequestingPayment] = useState(false);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(
    searchParams.get("redirect_status") === "succeeded",
  );

  const amount = useMemo(
    () => (budget ? calculateFinalPaymentAmount(budget) : 0),
    [budget],
  );

  useEffect(() => {
    let active = true;

    const loadBudget = async () => {
      if (!budgetId) {
        setError("No se ha indicado ningún presupuesto.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getBudgetFinalDetails(budgetId);
        if (!isFinalPaymentEligible(response.status)) {
          throw new Error("Este presupuesto no está disponible para el pago final.");
        }
        if (active) setBudget(response);
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "No se pudo cargar el presupuesto.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadBudget();

    return () => {
      active = false;
    };
  }, [budgetId]);

  const handleStartPayment = async () => {
    if (!budget) return;
    if (!stripePromise) {
      setError("El pago online no está configurado en este momento.");
      return;
    }
    if (amount <= 0) {
      setError("El importe pendiente no es válido.");
      return;
    }

    setIsRequestingPayment(true);
    setError("");
    try {
      const response = await getStripeFinalSecret({ amount, budgetId: budget.id });
      if (Array.isArray(response)) {
        setError("Uno o varios productos ya no están disponibles.");
        return;
      }
      setClientSecret(response.clientSecret);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo iniciar el pago.",
      );
    } finally {
      setIsRequestingPayment(false);
    }
  };

  const returnUrl = `${window.location.origin}/reserva/${budgetId}/pago-final`;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Pago final</h1>
        {isLoading && <p className="mt-4 text-sm text-gray-600">Cargando presupuesto...</p>}
        {!isLoading && !stripePromise && !isPaymentCompleted && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            El pago online no está configurado en este momento.
          </p>
        )}
        {!isLoading && error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        {!isLoading && isPaymentCompleted && (
          <p role="status" className="mt-4 text-sm text-green-700">
            El pago se ha completado correctamente.
          </p>
        )}
        {!isLoading && budget && !error && !isPaymentCompleted && stripePromise && (
          <div className="mt-6 space-y-6">
            <dl className="grid gap-4 rounded-lg bg-gray-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-gray-500">Reserva</dt>
                <dd className="font-semibold text-gray-900">#{budget.budgetReference}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Fecha del evento</dt>
                <dd className="font-semibold text-gray-900">{formatDate(budget.eventDate)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Importe pendiente</dt>
                <dd className="text-xl font-semibold text-gray-900">{amount.toFixed(2)} €</dd>
              </div>
            </dl>
            {!clientSecret ? (
              <button
                type="button"
                onClick={handleStartPayment}
                disabled={isRequestingPayment || !stripePromise}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRequestingPayment ? "Preparando pago..." : `Pagar ${amount.toFixed(2)} €`}
              </button>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <FinalPaymentForm
                  amount={amount}
                  returnUrl={returnUrl}
                  onPaymentCompleted={() => setIsPaymentCompleted(true)}
                />
              </Elements>
            )}
          </div>
        )}
      </section>
    </main>
  );
};
