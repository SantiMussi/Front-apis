import {GetToken} from "./authService.js";

const BASE_URL = import.meta.env.VITE_API_URL;

//Devuelve el token
function authHeader() {
    //const token = localStorage.getItem('token');
    const token = GetToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

