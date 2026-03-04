export const baseURL = import.meta.env.VITE_API_BASE_URL;
export const tokenName = "token";

export const statusOptions = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PAID25", label: "Pagado 25%" },
  { value: "PAID", label: "Pagado" },
  { value: "TRANSFER_PAID", label: "Pago por transferencia" },
  { value: "RESERVED", label: "Reservado" },
  { value: "REJECTED", label: "Rechazado" },
  { value: "DELAYED", label: "Pospuesto" },
  { value: "PAID_PENDING", label: "Archivada" },
  { value: "EXPIRED", label: "Expirado" },
];
