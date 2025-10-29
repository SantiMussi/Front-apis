import { createAsyncThunk, createSlice} from "@reduxjs/toolkit"
import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL;

//Get de todos los productos
export const fetchProducts = createAsyncThunk('/products/fetchProducts', async () => {
    const { data } = await axios.get(BASE_URL);
    return data;
})

const productsSlice = createSlice({
    name: 'products',
    initialState: {
        //Esto para todos los endpoints q necesite
        products: [],
        loading: false,
        error: null
        //productId: {},
        //filterProducts: []
    },
    reducers: {}, //Solo maneja operaciones sincronas
    extraReducers: (builder) => {
        //Me permite agregar casos de uso
        builder
            .addCase(fetchProducts.pending, (state) => {
                //Si esta en pending
                state.loading = true,
                    state.error = null
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                //Success
                state.loading = false,
                    state.items = action.payload
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false,
                state.error = action.error.message
            })
    }
})