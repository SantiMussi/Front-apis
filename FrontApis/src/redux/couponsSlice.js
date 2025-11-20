import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {GetToken} from "../services/authService.js";

const BASE_URL = import.meta.env.VITE_API_URL;

// Funcion para que, si viene paginado como { content: [...] }, tomamos content. Si es array, lo usamos directo.
const resolveArray = (payload) => {
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload)) return payload;
  return [];
};

const resolveCouponId = (coupon) => coupon?.id ??  null;

const authHeaders = () => {
  //const token = localStorage.getItem("token");
  const token = GetToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchCoupons = createAsyncThunk(
  "coupons/fetchCoupons",
  async (_, { rejectWithValue }) => { // usamos rejectWithValue para manejar errores
    try {
      const { data } = await axios.get(`${BASE_URL}/coupons`, {
        headers: { ...authHeaders() },
      });
      return resolveArray(data);
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Error al obtener cupones";
      return rejectWithValue(message);
    }
  }
);

export const createCoupon = createAsyncThunk(
  "coupons/createCoupon",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/coupons`, payload, {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });
      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Error al crear cupón";
      return rejectWithValue(message);
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  "coupons/deleteCoupon",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/coupons/${id}`, {
        headers: { ...authHeaders() },
      });
      return id;
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Error al eliminar el cupón";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  coupons: [],
  loading: false,
  error: null,
  saving: false,
  saveError: null,
};

const couponsSlice = createSlice({
  name: "coupons",
  initialState,
  reducers: {
    resetCouponErrors: (state) => {
      state.error = null;
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.coupons = [];
      })
      .addCase(createCoupon.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.saving = false;
        const created = action.payload;
        if (created && typeof created === "object") {
          const newId = resolveCouponId(created);
          if (newId !== null) {
            const index = state.coupons.findIndex((item) => resolveCouponId(item) === newId);
            if (index >= 0) {
              state.coupons[index] = created;
            } else {
              state.coupons.push(created);
            }
          }
        }
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || action.error.message;
      })
      .addCase(deleteCoupon.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.saving = false;
        const removedId = action.payload;
        state.coupons = state.coupons.filter(
          (coupon) => resolveCouponId(coupon) !== removedId
        );
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || action.error.message;
      });
  },
});

export const { resetCouponErrors } = couponsSlice.actions;

export default couponsSlice.reducer;