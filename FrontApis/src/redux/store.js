import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./productsSlice";
import couponsReducer from "./couponsSlice";
import categoriesReducer from "./categoriesSlice";
import ordersReducer from "./ordersSlice.js"
import usersReducer from "./usersSlice.js"

import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer, // registra el slice
    coupons: couponsReducer, 
    categories: categoriesReducer,
    orders: ordersReducer,
    users: usersReducer,
    cart: cartReducer,
  },
});

