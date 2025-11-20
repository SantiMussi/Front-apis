import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { GetToken } from "../services/authService.js";

const BASE_URL = import.meta.env.VITE_API_URL;

//Por si el contenido viene en un array, etc. Basicamente normaliza el payload
const resolveArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
}

// FUNCION HASTA IMPLEMENTAR EL AUTH DE USUARIOS CON REDUX
const authHeaders = () => {
    //const token = localStorage.getItem("token");

    const token = GetToken();

    return token ? { Authorization: `Bearer ${token}` } : {};
};

//Get de todas las categories
export const fetchCategories = createAsyncThunk(
    "categories/fetchCategories",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${BASE_URL}/categories`);
            const raw = Array.isArray(data) ? data : Array.isArray(data.content) ? data.content : [];

            const list = raw.map((c) => {
                if (typeof c === 'string') {
                    return { id: c, label: c };
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

//Post de categorias, requiere login
export const createCategory = createAsyncThunk(
    'categories/createCategory',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${BASE_URL}/categories`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders(),
                }
            });
            return data;
        }
        catch (error) {
            const message = error?.response?.data?.message || error.message || "Error creating category";
            return rejectWithValue(message);
        }
    }
)

//Put de categorias, requiere login
export const updateCategory = createAsyncThunk(
    'categories/updateCategory',
    async ({ id, description }, { rejectWithValue }) => {
        try {
            const payload = {description};
            const { data } = await axios.put(`${BASE_URL}/categories/modify/${id}`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders(),
                }
            });
            return data;
        } catch (error) {
            const message = error?.response?.data?.message || error.message || "Error updating category";
            return rejectWithValue(message);
        }
    }
);


//Delete de categorias, requiere login
export const deleteCategory = createAsyncThunk(
    'categories/deleteCategory',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axios.delete(`${BASE_URL}/categories/delete`, {
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders(),
                },
                data:  {id}
            });
            return id;
        } catch (error) {
            const message = error?.response?.data?.message || error.message || "Error deleting category";
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
            })

            //Create
            .addCase(createCategory.fulfilled, (state, action) => {
                const newCat = action.payload;
                //Normalizamos
                const normalized = {
                    id: newCat.id,
                    label: newCat.description
                };

                state.categories.push(normalized);
            })

            //Update
            .addCase(updateCategory.fulfilled, (state, action) => {
                const updatedCat = action.payload;
                const id = updatedCat.id;
                const index = state.categories.findIndex((c) => c.id === id);
                if (index !== -1) {
                    state.categories[index] = {
                        id: updatedCat.id,
                        label: updatedCat.description
                    }
                }
            })

            .addCase(deleteCategory.fulfilled, (state, action) => {
                const deletedId = action.meta.arg;
                state.categories = state.categories.filter((c) => c.id !== deletedId);
            });
    }
});

export default categoriesSlice.reducer;