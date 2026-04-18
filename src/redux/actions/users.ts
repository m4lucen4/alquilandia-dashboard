import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUserDetails,
  createUser,
  editUser,
  editUserProfile,
  fetchPaginatedUsers,
  getAdminAndTechnicians,
  fetchUserDetailsByEmailHash,
  blockUser,
  unblockUser,
  deleteUser,
  generateBudgetById,
  sendMassiveEmail,
  fetchUsersByPhone,
  type GetPaginatedUsersParams,
  type MassiveEmailData,
} from "../../services/usersService";
import type { User } from "@/types/budgets";

export const fetchUserDetails = createAsyncThunk(
  "users/fetchDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getUserDetails(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al obtener el usuario";
      return rejectWithValue(errorMessage);
    }
  },
);

export const createUserThunk = createAsyncThunk(
  "users/create",
  async (body: Partial<User>, { rejectWithValue }) => {
    try {
      return await createUser(body);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al crear el usuario";
      return rejectWithValue(errorMessage);
    }
  },
);

export const editUserThunk = createAsyncThunk(
  "users/edit",
  async (
    { id, body }: { id: string; body: Partial<User> },
    { rejectWithValue },
  ) => {
    try {
      return await editUser(id, body);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al editar el usuario";
      return rejectWithValue(errorMessage);
    }
  },
);

export const editUserProfileThunk = createAsyncThunk(
  "users/editProfile",
  async (
    { id, body }: { id: string; body: Partial<User> },
    { rejectWithValue },
  ) => {
    try {
      return await editUserProfile(id, body);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al editar el perfil del usuario";
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchPaginatedUsersThunk = createAsyncThunk(
  "users/fetchPaginated",
  async (params: GetPaginatedUsersParams, { rejectWithValue }) => {
    try {
      return await fetchPaginatedUsers(params);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al obtener los usuarios";
      return rejectWithValue(errorMessage);
    }
  },
);

export const getAdminAndTechniciansThunk = createAsyncThunk(
  "users/getAdminAndTechnicians",
  async (_, { rejectWithValue }) => {
    try {
      return await getAdminAndTechnicians();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al obtener técnicos y admins";
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchUserDetailsByEmailHashThunk = createAsyncThunk(
  "users/fetchDetailsByEmailHash",
  async (emailHash: string, { rejectWithValue }) => {
    try {
      return await fetchUserDetailsByEmailHash(emailHash);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al obtener el usuario";
      return rejectWithValue(errorMessage);
    }
  },
);

export const blockUserThunk = createAsyncThunk(
  "users/block",
  async (id: string, { rejectWithValue }) => {
    try {
      return await blockUser(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al bloquear el usuario";
      return rejectWithValue(errorMessage);
    }
  },
);

export const unblockUserThunk = createAsyncThunk(
  "users/unblock",
  async (id: string, { rejectWithValue }) => {
    try {
      return await unblockUser(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al desbloquear el usuario";
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteUserThunk = createAsyncThunk(
  "users/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      return await deleteUser(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al eliminar el usuario";
      return rejectWithValue(errorMessage);
    }
  },
);

export const generateBudgetByIdThunk = createAsyncThunk(
  "users/generateBudget",
  async (userId: string, { rejectWithValue }) => {
    try {
      return await generateBudgetById(userId);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al generar el presupuesto";
      return rejectWithValue(errorMessage);
    }
  },
);

export const sendMassiveEmailThunk = createAsyncThunk(
  "users/sendMassiveEmail",
  async (data: MassiveEmailData, { rejectWithValue }) => {
    try {
      await sendMassiveEmail(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al enviar el email";
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchUsersByPhoneThunk = createAsyncThunk(
  "users/fetchByPhone",
  async (phone: string, { rejectWithValue }) => {
    try {
      return await fetchUsersByPhone(phone);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al buscar usuarios por teléfono";
      return rejectWithValue(errorMessage);
    }
  },
);
