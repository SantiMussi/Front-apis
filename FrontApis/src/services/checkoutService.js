// Funciones CRUD cupones

export async function getCoupons(){
    const response = await fetch(`${BASE_URL}/coupons`, {
        headers: authHeader()
    });
    if(!response.ok) throw new Error('Error al obtener cupones');
    return response.json();
}

export async function createCoupon(coupon){
    const response = await fetch(`${BASE_URL}/coupons`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeader()
        },
        body: JSON.stringify(coupon)
    });
    if(!response.ok) throw new Error('Error al crear cupon: ' + (await response.json()).message);
    return response.json();
}

export async function getCouponByCode(code){
    const response = await fetch(`${BASE_URL}/coupons/${code}`, {
        headers: authHeader()
    });
    if(!response.ok) throw new Error('Error al obtener cupon por codigo');
    return response.json();
}

export async function deleteCoupon(id){
    const response = await fetch(`${BASE_URL}/coupons/${id}`, {
        method: 'DELETE',
        headers: authHeader()
    });
    if(!response.ok) throw new Error('Error al eliminar cupon')
    return response.json();
}


// Funciones CRUD ordenes

export async function getOrderById(id){
    const response = await fetch(`${BASE_URL}/orders/${id}`, {
        headers: authHeader()
    });
    if(!response.ok) throw new Error('Error al obtener orden con ID ' + id);
    return response.json();
}

