import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { fetchCurrentUser } from "./usersSlice";

const BASE_URL = import.meta.env.VITE_API_URL;

export const login = createAsyncThunk(
  "/api/v1/auth/authenticate",
  async (payload, thunkAPI) => {
    const response = await axios.post(
      `${BASE_URL}/api/v1/auth/authenticate`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;
  }
);

export const register = createAsyncThunk(
  "/api/v1/auth/register",
  async (payload, thunkAPI) => {
    const response = await axios.post(
      `${BASE_URL}/api/v1/auth/register`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;
  }
);

const initialState = {
  token: null,
  role: "",
  identifier: null,
  error: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setIdentifier: (state, action) => {
      state.identifier = action.payload ?? null;
    },
    logout: (state) => {
      state.token = null;
      state.role = "";
      state.identifier = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.role = action.payload.role ?? state.role;
        state.identifier = action.payload.email ?? null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Login error";
      })

      // REGISTER
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.role = action.payload.role;
        state.identifier = action.payload.email ?? null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Register error";
      })

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        const user = action.payload;
        if (!user) return;
        state.role = user.role ?? state.role;
        state.identifier = user.email ?? state.identifier;
      });
},
});

export const { setToken, setRole, setIdentifier, logout } = authSlice.actions;
export default authSlice.reducer;
