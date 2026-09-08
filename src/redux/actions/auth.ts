import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginUser,
  logoutUser,
  requestPasswordChange,
} from "../../services/authService";
import { isAllowedPlatformRole, type LoginPayload } from "@/types/auth";

// Thunk para login
export const login = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await loginUser(payload);
      if (!isAllowedPlatformRole(response.currentUser?.role)) {
        return rejectWithValue("No tienes permisos para acceder a la plataforma");
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al iniciar sesión";
      return rejectWithValue(errorMessage);
    }
  },
);

// Thunk para logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al cerrar sesión";
      return rejectWithValue(errorMessage);
    }
  },
);

// Thunk para solicitar cambio de contraseña
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (email: string, { rejectWithValue }) => {
    try {
      await requestPasswordChange(email);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al solicitar el cambio de contraseña";
      return rejectWithValue(errorMessage);
    }
  },
);
