import { createSlice } from "@reduxjs/toolkit";
import { fetchUserDetails } from "../actions/users";
import type { UsersState } from "@/types/users";

const initialState: UsersState = {
  currentUser: null,
  fetchUserDetailsRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null;
      state.fetchUserDetailsRequest = initialState.fetchUserDetailsRequest;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.fetchUserDetailsRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.fetchUserDetailsRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.fetchUserDetailsRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al obtener el usuario",
          ok: false,
        };
      });
  },
});

export const { clearCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;
