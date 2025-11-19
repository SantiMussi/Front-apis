import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./productsSlice";
import couponsReducer from "./couponsSlice";
import categoriesReducer from "./categoriesSlice";
import authReducer from "./authSlice.js"

export const store = configureStore({
  reducer: {
    products: productsReducer, // registra el slice
    coupons: couponsReducer, 
    categories: categoriesReducer,
    auth: authReducer,
  },
});

