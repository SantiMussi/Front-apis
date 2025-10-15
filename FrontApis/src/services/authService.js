const BASE_URL = import.meta.env.VITE_API_URL;

export function authHeader(){
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function getCurrentUser(){
    const res = await fetch(`${BASE_URL}/users/me`, {
        headers: {...authHeader()}
    });
    if(!res.ok) throw new Error(await res.text() || `Error ${res.status}`);
    return res.json();
}

//Helpers de rol
export function setRole(role){
    localStorage.setItem('role', role);
}

export function getRole(){
    return localStorage.getItem('role');
}

export function hasRole(...requiredRoles){
    const role = getRole();
    return !!role && requiredRoles.includes(role);
}

export function isLoggedIn() {
  return !!localStorage.getItem('token');
}



export async function login(email, password){
    // Usa la variable de entorno para la URL base
    const response = await fetch(`${BASE_URL}/api/v1/auth/authenticate`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
    });

    if(!response.ok) throw new Error(await response.text() || `Error ${response.status}`);
    return response.json();
}

export async function register(firstname, lastname, email, password){
    const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({firstname, lastname, email, password, role: 'USER'})
    })

    if(!response.ok){
        const errorData = await response.json().catch(() => null);
        const message = errorData?.message || `Error ${response.status}`
        throw new Error(message);
    }
    return response.json();
}
