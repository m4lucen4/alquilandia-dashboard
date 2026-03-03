import { createSlice } from "@reduxjs/toolkit";
import { updateProfile, changePassword } from "../actions/profile";
import type { ProfileState } from "@/types/profile";

const initialState: ProfileState = {
  updateProfileRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
  changePasswordRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearUpdateProfileRequest: (state) => {
      state.updateProfileRequest = initialState.updateProfileRequest;
    },
    clearChangePasswordRequest: (state) => {
      state.changePasswordRequest = initialState.changePasswordRequest;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.updateProfileRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.updateProfileRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateProfileRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al actualizar el perfil",
          ok: false,
        };
      });
    builder
      .addCase(changePassword.pending, (state) => {
        state.changePasswordRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changePasswordRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al cambiar la contraseña",
          ok: false,
        };
      });
  },
});

export const { clearUpdateProfileRequest, clearChangePasswordRequest } =
  profileSlice.actions;

export default profileSlice.reducer;
