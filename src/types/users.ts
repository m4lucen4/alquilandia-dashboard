import type { IRequest } from "./auth";
import type { User } from "./budgets";

export interface UsersState {
  currentUser: User | null;
  fetchUserDetailsRequest: IRequest;
}

export {type User} from "./budgets";