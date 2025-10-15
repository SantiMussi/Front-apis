const BASE_URL = import.meta.env.VITE_API_URL;

//Devuelve el token
function authHeader(){
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

//Funciones CRUD PRODUCTOS

export async function getProducts(){
    const response = await fetch(`${BASE_URL}/product`, {
        headers: authHeader()
    });
    if(!response.ok) throw new Error('Error al obtener productos');
    return response.json();
}

//Crear producto

export async function createProduct(product){
    console.log(product)
    const response = await fetch(`${BASE_URL}/product`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeader()
        },
        body: JSON.stringify(product)
    });
    if(!response.ok) throw new Error('Error al crear producto');
    return response.json();
}

// Actualizar producto existente

export async function updateProduct(id, product){
    const response = await fetch(`${BASE_URL}/product/${id}/modify`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeader()
        },
        body: JSON.stringify(product)
    });
    if(!response.ok) throw new Error('Error al actualizar producto');
    return response.json();
}

// Eliminar producto

export async function deleteProduct(id){
    const response = await fetch(`${BASE_URL}/product/${id}/delete`, {
        method: 'DELETE',
        headers: authHeader()
    });
    if(!response.ok) throw new Error('Error al eliminar producto')
}

// CATEGORIAS

// Obtener todas las categorias

export async function getCategories(){
    const response = await fetch(`${BASE_URL}/categories`, {
        headers: authHeader()
    });
    if(!response.ok) throw new Error('Error al obtener categorias');
    return response.json();
}

export async function getCategoryById(id){
    const response = await fetch(`${BASE_URL}/categories/${id}`, {
        headers: authHeader()
    });
    if(!response.ok) throw new Error('Error al obtener categoria');
    return response.json();
}

// Crear categoria

export async function createCategory(category){
    const response = await fetch(`${BASE_URL}/categories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeader()},
            body: JSON.stringify(category)
        });
    if(!response.ok) throw new Error('Error al crear categoria');
    return response.json();
}


// Eliminar categorua

export async function deleteCategory(id){
    const response = await fetch(`${BASE_URL}/category/${id}/delete`, {
        method: 'DELETE',
        headers: authHeader()
    });
    if(!response.ok) throw new Error('Error al eliminar producto')
}


// USUARIOS

export async function getUsers(){
    const response = await fetch(`${BASE_URL}/users`, {
        headers: authHeader()
    });
    if(!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
}

// Update user
export async function updateUser(id, user){
    const response = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeader()},
        body: JSON.stringify(user)
    });
    if(!response.ok) throw new Error('Error al actualizar usuario');
    return response.json();
}

export async function deleteUser(id){
    const response = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: authHeader()
    });
    if(!response.ok) throw new Error('Error al eliminar usuario');
}