import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  editUserProfile,
  changeCurrentUserPassword,
} from "@/services/profileService";
import type { ProfileFormData, PasswordFormData } from "@/types/profile";

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (
    { id, body }: { id: string; body: ProfileFormData },
    { rejectWithValue },
  ) => {
    try {
      const updatedUser = await editUserProfile(id, body);
      return updatedUser;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al actualizar el perfil";
      return rejectWithValue(errorMessage);
    }
  },
);

export const changePassword = createAsyncThunk(
  "profile/changePassword",
  async (body: PasswordFormData, { rejectWithValue }) => {
    try {
      await changeCurrentUserPassword(body);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al cambiar la contraseña";
      return rejectWithValue(errorMessage);
    }
  },
);
