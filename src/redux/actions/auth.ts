import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, logoutUser } from "../../services/authService";
import type { LoginPayload } from "@/types/auth";

// Thunk para login
export const login = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await loginUser(payload);
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
