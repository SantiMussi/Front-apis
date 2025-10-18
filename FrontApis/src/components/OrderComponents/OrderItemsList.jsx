import { getItemThumb } from "../../helpers/orderHelpers";

function formatCurrency(value, currency) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency,
    }).format(value);
}

function OrderItemRow({ item, currency }) {
    const name = item?.name || "Ítem";
    const qty = item?.quantity ?? 1;
    const price = item?.price ?? item?.unitPrice ?? item?.product?.price ?? 0;
    const lineTotal = price * qty;
    const img = getItemThumb(item);

    return (
        <li className="order-item">
            <div className="order-item__visual">
                {img ? (
                    <img src={img} alt={name} />
                ) : (
                    <div className="vf-mini-empty">IMG</div>
                )}
            </div>
            <div className="order-item__main">
                <h4>{name}</h4>
                <p className="admin-item-meta">
                    Cantidad: {qty} · Precio unidad: {formatCurrency(price, currency)}
                </p>
            </div>
            <div className="order-item__total">{formatCurrency(lineTotal, currency)}</div>
        </li>
    );
}

export default function OrderItemsList({ items, currency }) {
    if (!Array.isArray(items) || items.length === 0) {
        return <div className="no-product compact">Orden sin ítems</div>;
    }

    return (
        <ul className="order-items">
            {items.map((item, idx) => (
                <OrderItemRow key={idx} item={item} currency={currency} />
            ))}
        </ul>
    );
}