/**
 * Get status badge configuration for budget status
 * Returns configuration object with label and className
 */
export const getStatusBadgeConfig = (
  status: string,
): { label: string; className: string } => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PAID_PENDING: {
      label: "Pendiente",
      className: "bg-yellow-100 text-yellow-800",
    },
    PAID25: {
      label: "Pagado 25%",
      className: "bg-emerald-100 text-emerald-700",
    },
    PAID: {
      label: "Pagado",
      className: "bg-green-100 text-green-800",
    },
    RESERVED: {
      label: "Reservado",
      className: "bg-blue-100 text-blue-800",
    },
    REJECTED: {
      label: "Rechazado",
      className: "bg-red-100 text-red-800",
    },
    CANCELLED: {
      label: "Cancelado",
      className: "bg-gray-100 text-gray-800",
    },
  };

  return (
    statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    }
  );
};
