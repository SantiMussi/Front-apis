import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios"


const BASE_URL = import.meta.env.VITE_API_URL;

const resolveArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
}

const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// Get orders
export const fetchOrders = createAsyncThunk(
    "orders/fetchOrders",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${BASE_URL}/orders`, {
                headers: {...authHeaders()},
            });
            return resolveArray(data);
        } catch(error) {
            const message = error?.response?.data?.message || error?.message || "Error al obtener ordenes";
            return rejectWithValue(message);
        }
    }
)

export const updateOrderStatus = createAsyncThunk(
    "orders/updateOrderStatus",
    async ({orderId, status}, { rejectWithValue }) => {
        try {
            const payload = {status};
            const { data } = await axios.put(`${BASE_URL}/orders/${orderId}/status`,
                null,
                {
                    headers: {...authHeaders()},
                    params: payload,
                })
            return { orderId, status };
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || "Error al actualizar estado";
            return rejectWithValue(message);
        }
    }
)

export const createOrder = createAsyncThunk(
    "orders/createOrder",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${BASE_URL}/purchase`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders()},
            })
            return data;
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || "Error al crear orden";
            return rejectWithValue(message);
        }
    }
)

const initialState = {
    orders: [],
    loading : false,
    error: null,
}

const ordersSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
                state.orders = []
            })

            // Update
            .addCase(updateOrderStatus.pending, (state => {
                state.loading = true;
                state.error = null;
            }))
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                const { orderId, status } = action.payload || {};
                const index = state.orders.findIndex((o) => o.id === orderId);

                if (index !== -1){
                    state.orders[index] = {
                        ...state.orders[index],
                        status
                    }
                }
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
                state.error = action.payload || action.error.message;
            })
    }
})

export default ordersSlice.reducer;