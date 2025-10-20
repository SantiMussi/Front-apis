export function normalizePage(payload) {
    if (!payload) {
        return { items: [], totalPages: 1, totalElements: 0 };
    }

    if (Array.isArray(payload?.content)) {
        return {
            items: payload.content,
            totalPages: payload.totalPages ?? 1,
            totalElements: payload.totalElements ?? payload.content.length,
        };
    }

    if (Array.isArray(payload)) {
        return { items: payload, totalPages: 1, totalElements: payload.length };
    }

    const items = payload.items || payload.data || [];
    return {
        items: Array.isArray(items) ? items : [],
        totalPages: payload.totalPages ?? 1,
        totalElements: payload.total ?? items.length,
    };
}

export function statusClass(status) {
    const s = (status || "").toLowerCase();
    if (["paid", "completed", "approved"].includes(s)) return "ok";
    if (["shipped", "delivered", "sent"].includes(s)) return "ship";
    if (["pending", "processing"].includes(s)) return "pending";
    if (["cancelled", "canceled", "rejected", "failed"].includes(s)) return "bad";
    return "neutral";
}

export function getItemThumb(item) {
    return (
        item?.image_preview_url ||
        item?.base64img ||
        item?.image ||
        item?.img ||
        item?.product?.base64img ||
        null
    );
}

export function getOrderItems(order) {
    if (Array.isArray(order?.items)) return order.items;
    if (Array.isArray(order?.orderItems)) return order.orderItems;
    return [];
}

export function resolveOrderId(order) {
    return order?.id ?? order?.orderId ?? order?.code ?? "-";
}

export function resolveOrderStatus(order) {
    return order?.status ?? order?.OrderStatus ?? "Pending";
}

export function resolveOrderCreatedAt(order) {
    return order?.createdAt || order?.date || order?.created_date || null;
}

export function resolveOrderTotal(order) {
    return (
        order?.total ??
        order?.totalAmount ??
        order?.amount ??
        order?.summary?.total ??
        order?.totalPrice ??
        0
    );
}

export function resolveOrderCurrency(order) {
    return order?.currency || "ARS";
}