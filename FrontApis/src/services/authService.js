export async function login(email, password){
    // Usa la variable de entorno para la URL base
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4002';
    const response = await fetch(`${baseUrl}/api/v1/auth/authenticate`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
    });
    if(!response.ok){
        //Intenta extraer el msg de error 
        const errorData = await response.json().catch(() => null);
        const message = errorData?.message || 'Error ${response.status}'
        throw new Error(message);
        }

        return response.json();
}