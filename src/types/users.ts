import type { IRequest } from "./auth";
import type { User } from "./budgets";

export interface UsersState {
  // Detalle de usuario individual
  currentUser: User | null;
  fetchUserDetailsRequest: IRequest;
  fetchUserDetailsByEmailHashRequest: IRequest;
  // Listado paginado
  users: User[];
  usersTotal: number;
  fetchPaginatedUsersRequest: IRequest;
  // Técnicos / admins
  technicians: User[];
  getAdminAndTechniciansRequest: IRequest;
  // Mutaciones
  createUserRequest: IRequest;
  editUserRequest: IRequest;
  editUserProfileRequest: IRequest;
  blockUserRequest: IRequest;
  unblockUserRequest: IRequest;
  deleteUserRequest: IRequest;
  generateBudgetRequest: IRequest;
  sendMassiveEmailRequest: IRequest;
}

export { type User } from "./budgets";
