import { type FormEvent, type FC, useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import Button from "@/components/shared/Button";

interface FinalPaymentFormProps {
  returnUrl: string;
  amount: number;
  onPaymentCompleted: () => void;
}

export const FinalPaymentForm: FC<FinalPaymentFormProps> = ({
  returnUrl,
  amount,
  onPaymentCompleted,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setError("");

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message || "No se pudo procesar el pago.");
      setIsSubmitting(false);
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      onPaymentCompleted();
      return;
    }

    setError("El pago requiere una confirmación adicional.");
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <Button
        title={`Pagar ${amount.toFixed(2)} €`}
        onClick={() => undefined}
        type="submit"
        loading={isSubmitting}
        disabled={!stripe || !elements}
        block
      />
    </form>
  );
};
