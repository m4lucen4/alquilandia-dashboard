import { createSlice } from "@reduxjs/toolkit";
import {
  fetchUserDetails,
  createUserThunk,
  editUserThunk,
  editUserProfileThunk,
  fetchPaginatedUsersThunk,
  getAdminAndTechniciansThunk,
  fetchUserDetailsByEmailHashThunk,
  blockUserThunk,
  unblockUserThunk,
  deleteUserThunk,
  generateBudgetByIdThunk,
  sendMassiveEmailThunk,
} from "../actions/users";
import type { UsersState } from "@/types/users";

const requestIdle = { inProgress: false, messages: "", ok: false };

const initialState: UsersState = {
  currentUser: null,
  fetchUserDetailsRequest: requestIdle,
  fetchUserDetailsByEmailHashRequest: requestIdle,
  users: [],
  usersTotal: 0,
  fetchPaginatedUsersRequest: requestIdle,
  technicians: [],
  getAdminAndTechniciansRequest: requestIdle,
  createUserRequest: requestIdle,
  editUserRequest: requestIdle,
  editUserProfileRequest: requestIdle,
  blockUserRequest: requestIdle,
  unblockUserRequest: requestIdle,
  deleteUserRequest: requestIdle,
  generateBudgetRequest: requestIdle,
  sendMassiveEmailRequest: requestIdle,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null;
      state.fetchUserDetailsRequest = requestIdle;
      state.fetchUserDetailsByEmailHashRequest = requestIdle;
    },
    clearUsersTable: (state) => {
      state.users = [];
      state.usersTotal = 0;
      state.fetchPaginatedUsersRequest = requestIdle;
    },
    clearUsersScreenErrors: (state) => {
      state.fetchPaginatedUsersRequest = requestIdle;
      state.sendMassiveEmailRequest = requestIdle;
      state.createUserRequest = requestIdle;
      state.editUserRequest = requestIdle;
    },
  },
  extraReducers: (builder) => {
    // fetchUserDetails
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

    // fetchUserDetailsByEmailHash
    builder
      .addCase(fetchUserDetailsByEmailHashThunk.pending, (state) => {
        state.fetchUserDetailsByEmailHashRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(fetchUserDetailsByEmailHashThunk.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.fetchUserDetailsByEmailHashRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(fetchUserDetailsByEmailHashThunk.rejected, (state, action) => {
        state.fetchUserDetailsByEmailHashRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al obtener el usuario",
          ok: false,
        };
      });

    // fetchPaginatedUsers
    builder
      .addCase(fetchPaginatedUsersThunk.pending, (state) => {
        state.fetchPaginatedUsersRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(fetchPaginatedUsersThunk.fulfilled, (state, action) => {
        state.users = action.payload.users;
        state.usersTotal = action.payload.total ?? 0;
        state.fetchPaginatedUsersRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(fetchPaginatedUsersThunk.rejected, (state, action) => {
        state.fetchPaginatedUsersRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al obtener los usuarios",
          ok: false,
        };
      });

    // getAdminAndTechnicians
    builder
      .addCase(getAdminAndTechniciansThunk.pending, (state) => {
        state.getAdminAndTechniciansRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(getAdminAndTechniciansThunk.fulfilled, (state, action) => {
        state.technicians = action.payload;
        state.getAdminAndTechniciansRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(getAdminAndTechniciansThunk.rejected, (state, action) => {
        state.getAdminAndTechniciansRequest = {
          inProgress: false,
          messages:
            (action.payload as string) ||
            "Error al obtener técnicos y admins",
          ok: false,
        };
      });

    // createUser
    builder
      .addCase(createUserThunk.pending, (state) => {
        state.createUserRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(createUserThunk.fulfilled, (state) => {
        state.createUserRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(createUserThunk.rejected, (state, action) => {
        state.createUserRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al crear el usuario",
          ok: false,
        };
      });

    // editUser
    builder
      .addCase(editUserThunk.pending, (state) => {
        state.editUserRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(editUserThunk.fulfilled, (state) => {
        state.editUserRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(editUserThunk.rejected, (state, action) => {
        state.editUserRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al editar el usuario",
          ok: false,
        };
      });

    // editUserProfile
    builder
      .addCase(editUserProfileThunk.pending, (state) => {
        state.editUserProfileRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(editUserProfileThunk.fulfilled, (state) => {
        state.editUserProfileRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(editUserProfileThunk.rejected, (state, action) => {
        state.editUserProfileRequest = {
          inProgress: false,
          messages:
            (action.payload as string) ||
            "Error al editar el perfil del usuario",
          ok: false,
        };
      });

    // blockUser
    builder
      .addCase(blockUserThunk.pending, (state) => {
        state.blockUserRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(blockUserThunk.fulfilled, (state) => {
        state.blockUserRequest = { inProgress: false, messages: "", ok: true };
      })
      .addCase(blockUserThunk.rejected, (state, action) => {
        state.blockUserRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al bloquear el usuario",
          ok: false,
        };
      });

    // unblockUser
    builder
      .addCase(unblockUserThunk.pending, (state) => {
        state.unblockUserRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(unblockUserThunk.fulfilled, (state) => {
        state.unblockUserRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(unblockUserThunk.rejected, (state, action) => {
        state.unblockUserRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al desbloquear el usuario",
          ok: false,
        };
      });

    // deleteUser
    builder
      .addCase(deleteUserThunk.pending, (state) => {
        state.deleteUserRequest = { inProgress: true, messages: "", ok: false };
      })
      .addCase(deleteUserThunk.fulfilled, (state) => {
        state.deleteUserRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.deleteUserRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al eliminar el usuario",
          ok: false,
        };
      });

    // generateBudgetById
    builder
      .addCase(generateBudgetByIdThunk.pending, (state) => {
        state.generateBudgetRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(generateBudgetByIdThunk.fulfilled, (state) => {
        state.generateBudgetRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(generateBudgetByIdThunk.rejected, (state, action) => {
        state.generateBudgetRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al generar el presupuesto",
          ok: false,
        };
      });

    // sendMassiveEmail
    builder
      .addCase(sendMassiveEmailThunk.pending, (state) => {
        state.sendMassiveEmailRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(sendMassiveEmailThunk.fulfilled, (state) => {
        state.sendMassiveEmailRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(sendMassiveEmailThunk.rejected, (state, action) => {
        state.sendMassiveEmailRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al enviar el email",
          ok: false,
        };
      });
  },
});

export const { clearCurrentUser, clearUsersTable, clearUsersScreenErrors } =
  usersSlice.actions;
export default usersSlice.reducer;
