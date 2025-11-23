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

const resolveCouponId = (coupon) => coupon?.id ?? null;

// HASTA TENER AUTH EN REDUX
const authHeaders = () => {
  //const token = localStorage.getItem("token");
  const token = GetToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// GET de cupones
export const fetchCoupons = createAsyncThunk(
  "coupons/fetchCoupons",
  async () => {
    const { data } = await axios.get(`${BASE_URL}/coupons`, {
      headers: { ...authHeaders() },
    });
    return resolveArray(data);
  }
);

// GET cupón por código
export const fetchCouponByCode = createAsyncThunk(
  "coupons/fetchCouponByCode",
  async (code) => {
    const trimmedCode = (code || "").toString().trim();
    if (!trimmedCode) {
      throw new Error("Código de cupón inválido");
    }

    const encodedCode = encodeURIComponent(trimmedCode);
    const { data } = await axios.get(`${BASE_URL}/coupons/${encodedCode}`, {
      headers: { ...authHeaders() },
    });

    return data;
  }
);

// POST de cupon
export const createCoupon = createAsyncThunk(
  "coupons/createCoupon",
  async (payload) => {
    const { data } = await axios.post(`${BASE_URL}/coupons`, payload, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });
    return data;
  }
);

// DELETE de cupon
export const deleteCoupon = createAsyncThunk(
  "coupons/deleteCoupon",
  async (id) => {
    await axios.delete(`${BASE_URL}/coupons/${id}`, {
      headers: { ...authHeaders() },
    });
    // devolvemos el id borrado para usarlo en el reducer
    return id;
  }
);

const initialState = {
  coupons: [],
  loading: false,
  error: null,
  saving: false,
  saveError: null,
  couponByCode: null,
  couponByCodeLoading: false,
  couponByCodeError: null,
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
      // FETCH
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload || [];
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error?.message || "Error al obtener cupones";
        state.coupons = [];
      })

      // FETCH BY CODE
      .addCase(fetchCouponByCode.pending, (state) => {
        state.couponByCodeLoading = true;
        state.couponByCodeError = null;
      })
      .addCase(fetchCouponByCode.fulfilled, (state, action) => {
        state.couponByCodeLoading = false;
        state.couponByCode = action.payload ?? null;

        if (action.payload && typeof action.payload === "object") {
          const fetchedCoupon = action.payload;
          const fetchedId = resolveCouponId(fetchedCoupon);
          const fetchedCode = fetchedCoupon?.code;
          const index = state.coupons.findIndex((coupon) => {
            const hasIdMatch =
              fetchedId !== null && resolveCouponId(coupon) === fetchedId;
            const hasCodeMatch =
              !!fetchedCode && coupon?.code === fetchedCode;
            return hasIdMatch || hasCodeMatch;
          });

          if (index >= 0) {
            state.coupons[index] = fetchedCoupon;
          } else {
            state.coupons.push(fetchedCoupon);
          }
        }
      })
      .addCase(fetchCouponByCode.rejected, (state, action) => {
        state.couponByCodeLoading = false;
        state.couponByCodeError =
          action.error?.message || "Error al obtener cupón";
        state.couponByCode = null;
      })

      // CREATE
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
            const index = state.coupons.findIndex(
              (item) => resolveCouponId(item) === newId
            );
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
        state.saveError =
          action.error?.message || "Error al crear cupón";
      })

      // DELETE
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
        state.saveError =
          action.error?.message || "Error al eliminar el cupón";
      });
  },
});

export const { resetCouponErrors } = couponsSlice.actions;
export default couponsSlice.reducer;
