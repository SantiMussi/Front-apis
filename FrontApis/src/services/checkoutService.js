import { authHeader } from "./authService";

const BASE_URL = import.meta.env.VITE_API_URL 

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

export async function purchaseOrder({ userId, items, couponCode, paymentMethod, shippingMethod }) {
    const payload = {
        userId,
        productIds: items.map(item => item.id),
        quantities: items.map(item => item.quantity),
        paymentMethod, // Debe ser uno de: "CREDITO", "DEBITO", "TRANSFERENCIA"
        shippingMethod, // Debe ser uno de: "EXPRESS", "STANDARD", "PICKUP"
    };

    if (couponCode) {
        payload.couponCode = couponCode;
    }

    const response = await fetch(`${BASE_URL}/product/purchase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeader()
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message = "Error al procesar la compra: " + (errorBody?.message || response.status);
        throw new Error(message);
    }

    return response.json();
}


// TEMP FUNCTION

export async function getProductById(id){
    const response = await fetch(`${BASE_URL}/product/${id}`, {
        headers: authHeader()
    });
    if(!response.ok) throw new Error('Error al obtener producto con ID ' + id);
    return response.json();
}