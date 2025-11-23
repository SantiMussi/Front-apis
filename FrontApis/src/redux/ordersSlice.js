import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { GetToken } from "../services/authService";

const BASE_URL = import.meta.env.VITE_API_URL;

const resolveArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

const matchesOrderId = (order, orderId) => (order?.id ?? order?.orderId) === orderId;

const authHeaders = () => {
  const token = GetToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get orders
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async () => {
    const { data } = await axios.get(`${BASE_URL}/orders`, {
      headers: { ...authHeaders() },
    });
    return resolveArray(data);
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ orderId, status }) => {
    const payload = { status };

    await axios.put(
      `${BASE_URL}/orders/${orderId}/status`,
      null,
      {
        headers: { ...authHeaders() },
        params: payload,
      }
    );
    return { orderId, status };
  }
);

// Create order
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (payload) => {
    const { data } = await axios.post(`${BASE_URL}/purchase`, payload, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });
    return data;
  }
);

export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async () => {
    const res = await axios.get(`${BASE_URL}/users/me/orders`, {
      headers: { ...authHeaders() },
    });

    return resolveArray(res.data);
  }
);

export const purchaseOrder = createAsyncThunk(
  "orders/purchaseOrder",
  async ({ userId, items, couponCode, paymentMethod, shippingMethod }) => {
    const payload = {
      userId,
      productIds: items.map((item) => item.id),
      quantities: items.map((item) => item.quantity),
      paymentMethod,
      shippingMethod,
    };

    if (couponCode) {
      payload.couponCode = couponCode;
    }

    const { data } = await axios.post(`${BASE_URL}/product/purchase`, payload, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return data;
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (orderId) => {
    const { data } = await axios.get(`${BASE_URL}/orders/${orderId}`, {
      headers: { ...authHeaders() },
    });
    return data;
  }
);


const initialState = {
  orders: [],
  loading: false,
  error: null,
  currentOrder: null,
  currentOrderLoading: false,
  currentOrderError: null,
  purchasing: false,
  purchaseError: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    resetOrdersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error?.message || "Error al obtener órdenes";
        state.orders = [];
      })

      // Update
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { orderId, status } = action.payload || {};
        const index = state.orders.findIndex((o) => matchesOrderId(o, orderId));

        if (index !== -1) {
          state.orders[index] = {
            ...state.orders[index],
            status,
          };
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error?.message || "Error al actualizar estado";
      })

      // Create
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        const created = action.payload;
        if (!created) return;
        state.orders.push(created);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error?.message || "Error al crear orden";
      })


      //User fetch
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Error al obtener órdenes";
        state.orders = [];
      })

      // Purchase
      .addCase(purchaseOrder.pending, (state) => {
        state.purchasing = true;
        state.purchaseError = null;
      })
      .addCase(purchaseOrder.fulfilled, (state, action) => {
        state.purchasing = false;
        const created = action.payload;
        if (created) {
          state.orders.push(created);
        }
      })
      .addCase(purchaseOrder.rejected, (state, action) => {
        state.purchasing = false;
        state.purchaseError =
          action.error?.message || "Error al crear orden";
      })

      // Fetch by id
      .addCase(fetchOrderById.pending, (state) => {
        state.currentOrderLoading = true;
        state.currentOrderError = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrderLoading = false;
        state.currentOrder = action.payload ?? null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.currentOrderLoading = false;
        state.currentOrderError =
          action.error?.message || "Error al obtener orden";
        state.currentOrder = null;

      });
  },
});

export const { resetOrdersError } = ordersSlice.actions;
export default ordersSlice.reducer;
