import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// Normalizacion del back
const resolveArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload?.content)) return payload.content;
  return [];
};

const resolveUserId = (user) => user?.id ?? null;

// Headers con token desde Redux (NO desde authService)
const authHeader = (getState) => {
  const token = getState().auth.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// GET /users
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, thunkAPI) => {
    const { data } = await axios.get(`${BASE_URL}/users`, {
      headers: authHeader(thunkAPI.getState),
    });
    return resolveArray(data);
  }
);

// PUT /users/[id]
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, user }, thunkAPI) => {
    const { data } = await axios.put(
      `${BASE_URL}/users/${id}`,
      user,
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeader(thunkAPI.getState),
        },
      }
    );
    return data;
  }
);

// GET /users/me
export const fetchCurrentUser = createAsyncThunk(
  "users/fetchCurrentUser",
  async (_, thunkAPI) => {
    const { data } = await axios.get(`${BASE_URL}/users/me`, {
      headers: authHeader(thunkAPI.getState),
    });
    return data;
  }
);

// Slice
const initialState = {
  users: [],
  loading: false,
  error: null,
  saving: false,
  saveError: null,
  currentUser: null,
  currentUserLoading: false,
  currentUserError: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetUserErrors: (state) => {
      state.error = null;
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH USERS
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Error al cargar usuarios";
        state.users = [];
      })

      // UPDATE USER
      .addCase(updateUser.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.saving = false;

        const { id, user } = action.meta.arg;
        const index = state.users.findIndex(
          (u) => resolveUserId(u) === id
        );

        if (index >= 0) {
          state.users[index] = {
            ...state.users[index],
            ...user,
          };
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.saving = false;
        state.saveError =
          action.error?.message || "Error al actualizar usuario";
      })

      // FETCH CURRENT USER
      .addCase(fetchCurrentUser.pending, (state) => {
        state.currentUserLoading = true;
        state.currentUserError = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.currentUserLoading = false;
        state.currentUser = action.payload ?? null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.currentUserLoading = false;
        state.currentUserError =
          action.error?.message || "Error al obtener usuario";
        state.currentUser = null;
      });
  },
});

export const { resetUserErrors } = usersSlice.actions;
export default usersSlice.reducer;
