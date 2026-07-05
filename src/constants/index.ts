export const baseURL = import.meta.env.VITE_API_BASE_URL;

export const MIN_BUDGET_AMOUNT = 40;
export const VAT_FACTOR = 0.21;
export const INITIAL_PAYMENT_FACTOR = 0.25;
export const CAIXA_ACCOUNT = "ES87 2100 8094 4502 0037 1339";
export const s3BaseURL = import.meta.env.VITE_S3_BASE_URL;
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

export const ROLE_OPTIONS = [
  { value: "CLIENT", label: "Cliente" },
  { value: "MANAGER", label: "Gestor" },
  { value: "ADMIN", label: "Administrador" },
  { value: "TECHNICIAN", label: "Técnico" },
];
