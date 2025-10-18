import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import OrderItemsList from "./OrderItemsList";
import {
    getItemThumb,
    getOrderItems,
    resolveOrderCurrency,
    resolveOrderCreatedAt,
    resolveOrderId,
    resolveOrderStatus,
    resolveOrderTotal,
    statusClass,
} from "../../helpers/orderHelpers";

function formatCurrency(value, currency) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency,
    }).format(value);
}

export default function OrderCard({ order }) {
    const [open, setOpen] = useState(false);

    const id = resolveOrderId(order);
    const status = resolveOrderStatus(order);
    const createdAt = resolveOrderCreatedAt(order);
    const total = resolveOrderTotal(order);
    const currency = resolveOrderCurrency(order);

    const items = useMemo(() => getOrderItems(order), [order]);

    const thumbs = useMemo(
        () => items.map(getItemThumb).filter(Boolean).slice(0, 4),
        [items]
    );

    return (
        <div className="order-card admin-card">
            <div className="order-card__header">
                <div className="order-card__title">
                    <h3>Orden #{id}</h3>
                    <span className={`status-badge ${statusClass(status)}`}>{status}</span>
                </div>

                <div className="order-card__meta">
                    <span className="order-meta">
                        <strong>Fecha:</strong>{" "}
                        {createdAt ? new Date(createdAt).toLocaleString() : "—"}
                    </span>
                    <span className="order-meta">
                        <strong>Ítems:</strong> {items.length}
                    </span>
                    <span className="order-meta">
                        <strong>Total:</strong>{" "}
                        {formatCurrency(total, currency)}
                    </span>
                </div>

                <div className="order-card__thumbs vf-mini">
                    {thumbs.length === 0 && <div className="vf-mini-empty">Sin preview</div>}
                    {thumbs.map((src, i) => (
                        <img key={i} src={src} alt={`item-${i}`} />
                    ))}
                </div>
            </div>

            <div className="order-card__actions">
                <button
                    className="admin-button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                >
                    {open ? "Ocultar detalle" : "Ver detalle"}
                </button>

                <Link className="admin-button primary" to={`/orders/${id}`}>
                    Abrir
                </Link>
            </div>

            {open && (
                <div className="order-card__body">
                    <OrderItemsList items={items} currency={currency} />
                </div>
            )}
        </div>
    );
}