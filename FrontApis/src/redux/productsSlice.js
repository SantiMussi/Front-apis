import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { captureOwnerStack } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;

// Funcion para que, si viene paginado como { content: [...] }, tomamos content. Si es array, lo usamos directo.
const resolveArray = (payload) => {
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload)) return payload;
  return [];
};

// Get de productos, general o por categoria
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  //Payload opcional: categoryId
  async ({ categoryId = null } = {}, { rejectWithValue }) => {
    try {
      //Si no hay una cat establecida, directamente va a product
      if (!categoryId) {
        const { data } = await axios.get(`${BASE_URL}/product`);
        const items = resolveArray(data);
        return items;
      }

      //Si hay categorai
      const { data } = await axios.get(`${BASE_URL}/categories/${categoryId}`);
      const items = Array.isArray(data?.products) ? data.products : [];
      return items;
    }
    //Caso de error
    catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Error al obtener productos";
      return rejectWithValue(message);
    }
  })
const initialState = {
  products: [],
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    resetProductsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.products = [];
      });
  },
});

export const { resetProductsError } = productsSlice.actions;
export default productsSlice.reducer;