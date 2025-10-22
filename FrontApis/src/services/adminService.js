const BASE_URL = import.meta.env.VITE_API_URL;

//Devuelve el token
function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

//Funciones CRUD PRODUCTOS

export async function getProducts() {
    const response = await fetch(`${BASE_URL}/product`, {
        headers: authHeader()
    });
    if (!response.ok) throw new Error('Error al obtener productos');
    return response.json();
}

//Crear producto

export async function createProduct(product) {
    const response = await fetch(`${BASE_URL}/product`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeader()
        },
        body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error('Error al crear producto: ' + (await response.json()).message);
    return response.json();
}

// Actualizar producto existente

export async function updateProduct(id, product) {
    const response = await fetch(`${BASE_URL}/product/${id}/modify`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeader()
        },
        body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error('Error al actualizar producto');
    return response.json();
}

// Eliminar producto

export async function deleteProduct(id) {
    const response = await fetch(`${BASE_URL}/product/${id}/delete`, {
        method: 'DELETE',
        headers: authHeader()
    });
    if (!response.ok) throw new Error('Error al eliminar producto')
}

// CATEGORIAS

// Obtener todas las categorias

export async function getCategories() {
    const response = await fetch(`${BASE_URL}/categories`, {
        headers: authHeader()
    });
    if (!response.ok) throw new Error('Error al obtener categorias');
    return response.json();
}

export async function getCategoryById(id) {
    const response = await fetch(`${BASE_URL}/categories/${id}`, {
        headers: authHeader()
    });
    if (!response.ok) throw new Error('Error al obtener categoria');
    return response.json();
}

// Crear categoria

export async function createCategory(category) {
    const response = await fetch(`${BASE_URL}/categories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeader()
        },
        body: JSON.stringify(category)
    });
    if (!response.ok) throw new Error('Error al crear categoria');
    return response.json();
}


// Eliminar categorua

export async function deleteCategory(id) {
    const response = await fetch(`${BASE_URL}/categories/delete`, {
        method: 'DELETE',
        headers:{ "Content-Type": "application/json", ...authHeader()},
        body: JSON.stringify({ id })
    });
    if (!response.ok) {
        const msg = await response.text();

        const errorData = JSON.parse(msg);
        throw new Error(errorData.message);
    }
    return true;
}


export async function updateCategory(categoryId, body) {
  const res = await fetch(`${BASE_URL}/categories/modify/${categoryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "Error desconocido");
    throw new Error(msg || "Error al actualizar la categoría");
  }

  // Si el backend no devuelve JSON o devuelve vacío (ej: 204)
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    // Intentamos leer texto por si hay mensaje tipo "Category modified"
    const text = await res.text().catch(() => "");
    return text || { id: categoryId, ...body };
  }

  // Si sí devuelve JSON válido
  return res.json();
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