import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { GetToken } from '../services/authService';

const BASE_URL = import.meta.env.VITE_API_URL;

// Hasta migrar AUTH a redux
const authHeader = () => {
    const token = GetToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Normalizacion del back
const resolveArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload?.content)) return payload.content;
    return [];
}

const resolveUserId = (user) => user?.id ?? null;


//Thunks
//Get de users
export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async () => {
        const { data } = await axios.get(`${BASE_URL}/users`, {
            headers: authHeader()
        });
        return resolveArray(data);
    }
);

//Put /users/[id]

export const updateUser = createAsyncThunk(
    "users/updateUser",
    async ({ id, user }) => {
        const { data } = await axios.put(`${BASE_URL}/users/${id}`, user, {
            headers: {
                "Content-Type": "application/json",
                ...authHeader(),
            },
        });
        return data;
    }
);

export const fetchCurrentUser = createAsyncThunk(
    "users/fetchCurrentUser",
    async () => {
        const { data } = await axios.get(`${BASE_URL}/users/me`, {
            headers: authHeader(),
        });
        return data;
    }
);

//Slice

const initialState = {
    users: [],
    loading: false,
    error: null,
    saving: false,
    saveError: null,
    currentUser: null,
    currentUserLoading: false,
    currentUserError: null,
}

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        resetUserErrors: (state) => {
            state.error = null;
            state.saveError = null;
        }
    },

    extraReducers: (builder) => {
        builder
            //Fetch users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload || [];
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Error al cargar usuarios';
                state.users = [];
            })

            //Update user

            .addCase(updateUser.pending, (state) => {
                state.saving = true;
                state.saveError = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.saving = false;

                const { id, user } = action.meta.arg;

                const index = state.users.findIndex(u => resolveUserId(u) === id);
                if (index >= 0) {
                    // mergea el usuario actual con los cambios
                    state.users[index] = {
                        ...state.users[index],
                        ...user,
                    };
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.saving = false;
                state.saveError =
                    action.error?.message || "Error al actualizar usuario";
            })
            .addCase(fetchCurrentUser.pending, (state) => {
                state.currentUserLoading = true;
                state.currentUserError = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.currentUserLoading = false;
                state.currentUser = action.payload ?? null;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.currentUserLoading = false;
                state.currentUserError =
                    action.error?.message || "Error al obtener usuario";
                state.currentUser = null;
            })
    },
});

export const { resetUserErrors } = usersSlice.actions;
export default usersSlice.reducer;