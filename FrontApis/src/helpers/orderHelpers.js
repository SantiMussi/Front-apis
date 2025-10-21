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

export function getOrderItems(order) {
    if (Array.isArray(order?.items)) return order.items;
    if (Array.isArray(order?.orderItems)) return order.orderItems;
    return [];
}

export function resolveOrderId(order) {
    return order?.id ?? order?.orderId ?? order?.code ?? "-";
}

export function resolveOrderStatus(order) {
    return order?.status ?? order?.orderStatus ?? "PENDIENTE";
}

export function resolveOrderCreatedAt(order) {
  const rawDate = order?.createdAt || order?.date || order?.issueDate || order?.created_date || order?.issue_date;
  return rawDate ? formatDate(rawDate) : null;
}

export function formatDate(isoString) {
  const [year, month, day] = isoString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
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