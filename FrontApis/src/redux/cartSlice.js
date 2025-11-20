import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // [{id, name, price, size, quantity, ...}]
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
    addToCart: (state, action) => {
        const item = action.payload;
        const existing = state.items.find((i) => i.id === item.id && i.size === item.size);
        if (existing) {
            existing.quantity += item.quantity || 1;
        } else {
            state.items.push({ ...item, quantity: item.quantity || 1 });
        }
    },
    removeFromCart: (state, action) => {
        const { id, size } = action.payload;
        state.items = state.items.filter((i) => !(i.id === id && i.size === size));
    },
    updateQuantity: (state, action) => {
        const { id, size, quantity } = action.payload;
        const item = state.items.find((i) => i.id === id && i.size === size);
        if (item) {
            item.quantity = Math.max(1, quantity);
        }
    },
    clearCart: (state) => {
        state.items = [];
    },
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;