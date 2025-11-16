import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { StaticRouter } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchCategories = createAsyncThunk(
    "categories/fetchCategories",
    async(_, { rejectWithValue}) => {
        try{
            const { data } = await axios.get(`${BASE_URL}/categories`);
            const raw = Array.isArray(data) ? data : Array.isArray(data.content) ? data.content : [];

            const list = raw.map((c) => {
                if (typeof c === 'string'){
                    return {id: c, label: c};
                }
                return {
                    id: c?.id ?? c?.description,
                    label: c?.description ?? c?.name ?? String(c?.id ?? ""),
                };
            });
            return list;
        } catch (error) {
            const message = error?.response?.data?.message || error.message || "Error fetching categories";
            return rejectWithValue(message);
        }
    }
);

const categoriesSlice = createSlice({
    name: "categories",
    initialState: {
        categories: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
                state.categories = [];
            });
        },
});

export default categoriesSlice.reducer;