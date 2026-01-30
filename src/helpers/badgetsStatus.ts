/**
 * Get status badge configuration for budget status
 * Returns configuration object with label and className
 */
export const getStatusBadgeConfig = (
  status: string,
): { label: string; className: string } => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: {
      label: "PAID_PENDING",
      className: "bg-yellow-100 text-yellow-800",
    },
    confirmed: {
      label: "Confirmado",
      className: "bg-green-100 text-green-800",
    },
    cancelled: {
      label: "Cancelado",
      className: "bg-red-100 text-red-800",
    },
    completed: {
      label: "Completado",
      className: "bg-blue-100 text-blue-800",
    },
  };

  return (
    statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    }
  );
};
