import { configureStore, combineReducers } from "@reduxjs/toolkit";

import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage/"

import productsReducer from "./productsSlice";
import couponsReducer from "./couponsSlice";
import categoriesReducer from "./categoriesSlice";
import authReducer from "./authSlice.js";

const rootReducer = combineReducers({
    products: productsReducer, // registra el slice
    coupons: couponsReducer,
    categories: categoriesReducer,
    auth: authReducer,
})


const persistConfig = {
    key: "root",
    storage,
    whitelist: ['auth'],
};


const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);