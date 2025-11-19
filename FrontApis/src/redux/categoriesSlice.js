import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

//Por si el contenido viene en un array, etc. Basicamente normaliza el payload
const resolveArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
}

// FUNCION HASTA IMPLEMENTAR EL AUTH DE USUARIOS CON REDUX
const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Normalizador de categoría -> { id, label }
const normalizeCategory = (c) => {
    if (typeof c === "string") {
        return { id: c, label: c };
    }
    return {
        id: c?.id ?? c?.description,
        label: c?.description ?? c?.name ?? String(c?.id ?? ""),
    };
};

// Get de todas las categorías
export const fetchCategories = createAsyncThunk(
    "categories/fetchCategories",
    async () => {
        const { data } = await axios.get(`${BASE_URL}/categories`);

        const raw = resolveArray(data);
        return raw.map(normalizeCategory);
    }
);


// Post de categorías, requiere login
export const createCategory = createAsyncThunk(
    "categories/createCategory",
    async (payload) => {
        const { data } = await axios.post(`${BASE_URL}/categories`, payload, {
            headers: {
                "Content-Type": "application/json",
                ...authHeaders(),
            },
        });
        return data;
    }
);

// Put de categorías, requiere login
export const updateCategory = createAsyncThunk(
    "categories/updateCategory",
    async ({ id, description }) => {
        const payload = { description };
        const { data } = await axios.put(
            `${BASE_URL}/categories/modify/${id}`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders(),
                },
            }
        );
        return data;
    }
);


// Delete de categorías, requiere login
export const deleteCategory = createAsyncThunk(
    "categories/deleteCategory",
    async (id) => {
        await axios.delete(`${BASE_URL}/categories/delete`, {
            headers: {
                "Content-Type": "application/json",
                ...authHeaders(),
            },
            data: { id },
        });

        // devolvemos el id borrado para usarlo en el reducer
        return id;
    }
);

const initialState = {
    categories: [],
    loading: false,
    error: null,
};

const categoriesSlice = createSlice({
    name: "categories",
    initialState,
    reducers: {
        resetCategoriesError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload || [];
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error?.message || "Error fetching categories";
                state.categories = [];
            })

            // CREATE
            .addCase(createCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.loading = false;
                const newCat = action.payload;
                if (!newCat) return;

                const normalized = normalizeCategory(newCat);
                state.categories.push(normalized);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error?.message || "Error creating category";
            })

            // UPDATE
            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false;
                const updatedCat = action.payload;
                if (!updatedCat) return;

                const id = updatedCat.id;
                const index = state.categories.findIndex((c) => c.id === id);
                if (index !== -1) {
                    state.categories[index] = normalizeCategory(updatedCat);
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error?.message || "Error updating category";
            })

            // DELETE
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loading = false;
                const deletedId = action.payload;
                if (deletedId == null) return;
                state.categories = state.categories.filter(
                    (c) => c.id !== deletedId
                );
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error?.message || "Error deleting category";
            });
    },
});

export const { resetCategoriesError } = categoriesSlice.actions;
export default categoriesSlice.reducer;