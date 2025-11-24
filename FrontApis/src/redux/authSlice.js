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
            const data = await axios.post(`${BASE_URL}/api/v1/auth/authenticate`, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return data;
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || "Log-In Error";
            return rejectWithValue(message);
        }
    }
)

export const register = createAsyncThunk(
    "/api/v1/auth/register",
    async(payload, {rejectWithValue}) => {
        try {
            const data = await axios.post(`${BASE_URL}/api/v1/auth/register`, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return data;
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || "Error trying to register user";
            return rejectWithValue(message);
        }
    }
)

const authSlice = createSlice({
   name: 'auth',
    initialState: {
        token: null,
        role: '',
        identifier: null,

    },
    reducers: {
       setToken: (state, action) => {
           state.token = action.payload;
       },
       setRole: (state, action) => {
           state.role = action.payload;
       },
        setIdentifier: (state, action) => {
           state.identifier = action.payload ?? null;
        }
    }

});

export const { setToken, setRole , setIdentifier} = authSlice.actions;
export default authSlice.reducer;