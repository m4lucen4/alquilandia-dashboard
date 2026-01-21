import { createSlice } from "@reduxjs/toolkit";
import { login, logout } from "../actions/auth";
import type { CurrentUser, IRequest } from "@/types/auth";

interface AuthState {
  authenticated: boolean;
  token: string | null;
  user: CurrentUser | null;
  loginRequest: IRequest;
  logoutRequest: IRequest;
}

const initialState: AuthState = {
  authenticated: false,
  token: null,
  user: null,
  loginRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
  logoutRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearLoginErrors: (state) => {
      state.loginRequest = initialState.loginRequest;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loginRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.currentUser;
        state.authenticated = true;
        state.loginRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.loginRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al iniciar sesión",
          ok: false,
        };
      });
    builder
      .addCase(logout.pending, (state) => {
        state.logoutRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(logout.fulfilled, (state) => {
        state.authenticated = false;
        state.user = null;
        state.token = null;
        state.logoutRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(logout.rejected, (state, action) => {
        state.logoutRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al cerrar sesión",
          ok: false,
        };
      });
  },
});

export const { clearLoginErrors } = authSlice.actions;

export default authSlice.reducer;
