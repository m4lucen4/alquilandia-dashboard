/**
 * Get status badge configuration for budget status
 * Returns configuration object with label and className
 */
export const getStatusBadgeConfig = (
  status: string,
): { label: string; className: string } => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: {
      label: "Pendiente",
      className: "bg-yellow-100 text-yellow-800",
    },
    PAID_PENDING: {
      label: "Archivada",
      className: "bg-gray-100 text-gray-800",
    },
    PAID25: {
      label: "Pagado 25%",
      className: "bg-sky-100 text-sky-800",
    },
    PAID: {
      label: "Pagado",
      className: "bg-green-100 text-green-800",
    },
    TRANSFER_PAID: {
      label: "Pago por transferencia",
      className: "bg-indigo-100 text-indigo-800",
    },
    RESERVED: {
      label: "Reservado",
      className: "bg-blue-100 text-blue-800",
    },
    REJECTED: {
      label: "Rechazado",
      className: "bg-red-100 text-red-800",
    },
    DELAYED: {
      label: "Pospuesto",
      className: "bg-orange-100 text-orange-800",
    },
    EXPIRED: {
      label: "Expirado",
      className: "bg-rose-100 text-rose-800",
    },
  };

  return (
    statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    }
  );
};
