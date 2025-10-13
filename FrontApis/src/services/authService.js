const BASE_URL = import.meta.env.VITE_API_URL;

export async function login(email, password){
    // Usa la variable de entorno para la URL base
    const response = await fetch(`${BASE_URL}/api/v1/auth/authenticate`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
    });

    if(!response.ok){
        const errorData = await response.json().catch(() => null);
        const message = errorData?.message || `Error ${response.status}`
        throw new Error(message);
        }

    return response.json();
}

export async function register(firstname, lastname, email, password){
    const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({firstname, lastname, email, password})
    })

    if(!response.ok){
        const errorData = await response.json().catch(() => null);
        const message = errorData?.message || `Error ${response.status}`
        throw new Error(message);
    }
    return response.json();
}