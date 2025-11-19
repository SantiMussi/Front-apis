import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { captureOwnerStack } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;

// Funcion para que, si viene paginado como { content: [...] }, tomamos content
const resolveArray = (payload) => {
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload)) return payload;
  return [];
};

//HASTA TENER EL AUTH EN REDUX
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get de productos, general o por categoria
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  //Payload opcional: categoryId
  async ({ categoryId = null } = {}) => {
    //Si no hay una cat establecida, directamente va a product
    if (!categoryId) {
      const { data } = await axios.get(`${BASE_URL}/product`);
      const items = resolveArray(data);
      return items;
    }

    //Si hay categorai
    const { data } = await axios.get(`${BASE_URL}/categories/${categoryId}`);
    return Array.isArray(data?.products) ? data.products : [];
  })

//Post de productos
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (payload) => {
    const { data } = await axios.post(`${BASE_URL}/product`, payload, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });
    return data;
  }
);

//Put de producto
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, payload }) => {
    const { data } = await axios.put(
      `${BASE_URL}/product/${id}/modify`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      }
    );
    return data;
  }
);


//Delete de producto
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id) => {
    await axios.delete(`${BASE_URL}/product/${id}/delete`, {
      headers: authHeaders(),
    });
    // devolvemos el id para poder sacarlo del estado
    return id;
  }
);

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
      // FETCH
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Error al obtener productos";
        state.products = [];
      })

      // CREATE
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        const created = action.payload;
        if (!created) return;
        state.products.push(created);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Error al crear producto";
      })

      // UPDATE
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (!updated) return;

        const id = updated.id ?? action.meta?.arg?.id;
        if (id == null) return;

        const idx = state.products.findIndex((p) => p.id === id);
        if (idx !== -1) {
          state.products[idx] = {
            ...state.products[idx],
            ...updated,
          };
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Error al actualizar producto";
      })

      // DELETE
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        if (id == null) return;
        state.products = state.products.filter((p) => p.id !== id);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Error al eliminar producto";
      });
  },
});

export const { resetProductsError } = productsSlice.actions;
export default productsSlice.reducer;