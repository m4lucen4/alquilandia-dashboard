import type { IRequest } from "./auth";

// User information
export interface User {
  id: string;
  address: string;
  blocked: boolean;
  discount: number;
  dnif: string;
  email: string;
  emailHash: string;
  estado: string;
  firstName: string;
  lastName: string;
  locality: string;
  password: string;
  phone: string;
  phone2: string;
  population: string;
  registered: string;
  role: string;
  zipCode: string;
  FullName: string;
  googleId: string;
  appleId: string;
  company: string | null;
  isDeleted: boolean;
  deletedAt: string;
  problematic: boolean;
}

// Location information
export interface Location {
  latitude: string;
  longitude: string;
}

// Payment information
export interface PaymentHpp {
  AMOUNT: string;
  ORDER_ID: string;
  MERCHANT_ID: string;
  TIMESTAMP: string;
}

export interface Payment {
  type: string;
  hpp: PaymentHpp;
}

// Price information
export interface Price {
  costSend: number;
  subTotalWithExtras: number;
  userDiscountPercentage: number;
  userDiscount: number;
  extras: number;
  total: number;
  vat: number;
  packs: number;
  subTotal: number;
  withIVA: boolean;
  alreadyPaid: number;
}

// Budget line items
export interface PriceException {
  id: string;
  price: number;
  date: string;
}

export interface Extra {
  id: string;
  checked: boolean;
  price: number;
  extraName: string;
  units: number;
}

export interface Archivo {
  id: string;
  fileName: string;
  fileId: string;
  fileUri: string;
}

export interface BudgetLine {
  id: string;
  elemento: string;
  unidades: number;
  observaciones: string;
  codigo: string | null;
  nombre: string | null;
  categoria: string;
  precioUd: number;
  preciocoste: number;
  costetotal: number;
  bloqueo: number;
  objetoid: string;
  private: boolean;
  priceExceptionList: PriceException[];
  extras: Extra[];
  archivo: Archivo[];
  datetime: string;
  originalPrice: number;
  units: number;
  descuento: number;
  extra: string;
  totalPrice: number;
}

// Main Budget interface
export interface Budget {
  id: string;
  address: string;
  budgetId: string;
  budgetReference: number;
  cancelled: boolean;
  comments: string;
  commentsalquilandia: string;
  concepto: string;
  creationDate: string;
  deletedAt: string | null;
  distance: string;
  eventDate: string;
  finished: boolean;
  isDelayed: boolean;
  lastUpdatedDate: string;
  locality: string;
  location: Location;
  nosend: boolean;
  payment: Payment;
  price: Price;
  status: string;
  technicianEmailHash: string;
  userEmailHash: string;
  client: string;
  phone: string;
  user: User;
  technician: User;
  nReceipt: number;
  receiptDate: string;
  afiliatedPhone: string;
  budgetLines: BudgetLine[];
}

// API Response
export interface BudgetsResponse {
  budgets: Budget[];
  total?: number;
}

// Redux State
export interface BudgetsState {
  budgets: Budget[];
  total: number;
  fetchBudgetsRequest: IRequest;
}
