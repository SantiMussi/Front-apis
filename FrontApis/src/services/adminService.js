const BASE_URL = import.meta.env.VITE_API_URL;

//Devuelve el token
function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// USUARIOS

export async function getUsers() {
    const response = await fetch(`${BASE_URL}/users`, {
        headers: authHeader()
    });
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
}

// Update user
export async function updateUser(id, user) {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeader()
        },
        body: JSON.stringify(user)
    });
    if (!response.ok) throw new Error('Error al actualizar usuario');
    return response.json();
}

export async function deleteUser(id) {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: authHeader()
    });
    if (!response.ok) throw new Error('Error al eliminar usuario');
}


// Funciones CRUD cupones

export async function getCoupons() {
    const response = await fetch(`${BASE_URL}/coupons`, {
        headers: authHeader()
    });
    if (!response.ok) throw new Error('Error al obtener cupones');
    return response.json();
}

export async function createCoupon(coupon) {
    const response = await fetch(`${BASE_URL}/coupons`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeader()
        },
        body: JSON.stringify(coupon),
    });
    if (!response.ok) throw new Error('Error al crear cupon');
    return response.json();
}

export async function deleteCoupon(id) {
    const response = await fetch(`${BASE_URL}/coupons/${id}`, {
        method: "DELETE",
        headers: authHeader()
    });
    if (!response.ok) throw new Error('Error al eliminar cupon');
    return response.json();
}