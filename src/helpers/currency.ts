/**
 * Formatea un monto en euros
 * @param amount - Monto a formatear
 * @returns Monto formateado
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};
