import type { IRequest } from "./auth";

export interface Discount {
  id: string;
  concepto: string;
  porcentaje: number;
}

export interface DiscountsState {
  discounts: Discount[];
  fetchDiscountsRequest: IRequest;
}
