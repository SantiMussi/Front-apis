import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const resolveArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
}

export const login = createAsyncThunk(
    "/api/v1/auth/authenticate",
    async(payload, {rejectWithValue}) => {
        try {
            const { data } = await axios.post(`${BASE_URL}/product`, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return data;
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || "Error de Log-In";
            return rejectWithValue(message);
        }
    }
)