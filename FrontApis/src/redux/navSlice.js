import {createSlice} from "@reduxjs/toolkit";

const navSlice = createSlice({
    name: 'nav',
    initialState:{
        lastPath: '/'
    },
    reducers:{
        setLastPath(state, action){
            state.lastPath =  action.payload;
        }
    }
});

export const {setLastPath} = navSlice.actions;

export default navSlice.reducer;