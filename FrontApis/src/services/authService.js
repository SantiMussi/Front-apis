const BASE_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';

const authEmitter = new EventTarget();
const notifyAuth = () => authEmitter.dispatchEvent(new Event('auth-change'));

export function onAuthChange(cb){
    const handler = () => cb( {isLoggedIn: isLoggedIn(), role: getRole()} );
    authEmitter.addEventListener('auth-change', handler);

    //cleanup
    return () => authEmitter.removeEventListener('auth-change', handler);
}

//Token y headers 
export function authHeader(){
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export function setToken(token){
    if(token){
        localStorage.setItem(TOKEN_KEY, token)
        notifyAuth();
    }
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export function getToken(){
    return localStorage.getItem(TOKEN_KEY);
}

export function logout(){
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    notifyAuth();
}

//User / rol
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
    notifyAuth();
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


// AUTH API
export async function login(email, password){
    // Usa la variable de entorno para la URL base
    const response = await fetch(`${BASE_URL}/api/v1/auth/authenticate`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
    });


  if (!response.ok) {
    const errorText = await response.text();

    const errorData = JSON.parse(errorText);
    throw new Error(errorData.message);
  }

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
