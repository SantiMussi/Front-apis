import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./productsSlice";
import couponsReducer from "./couponsSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer, // registra el slice
    coupons: couponsReducer, 
  },
});

