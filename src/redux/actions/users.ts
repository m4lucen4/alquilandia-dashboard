import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUserDetails } from "../../services/usersService";

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
