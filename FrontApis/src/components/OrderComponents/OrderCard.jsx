import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import OrderItemsList from "./OrderItemsList";
import {
    getOrderItems,
    resolveOrderCurrency,
    resolveOrderCreatedAt,
    resolveOrderId,
    resolveOrderStatus,
    resolveOrderTotal,
    } from "../../helpers/orderHelpers";

function formatCurrency(value, currency) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency,
    }).format(value);
}

/**
 * Props
 * -order: objeto de orden
 * - variant: 'Buyer' | "seller" (default es buyer)
 * - showOpenButton: boolean (defualt es true), muestra el link a orders/{id}
 * - onOpenChange: (open: boolean)->void (opcional), avisa la expansion o colapso
 */

export default function OrderCard({
    order,
    variant = "buyer",
    onOpenChange,
}) {
    const [open, setOpen] = useState(false);

    const id = resolveOrderId(order);
    const status = resolveOrderStatus(order);
    const createdAt = resolveOrderCreatedAt(order);
    const total = resolveOrderTotal(order);
    const currency = resolveOrderCurrency(order);

    const items = useMemo(() => getOrderItems(order), [order]);
   
    //Meta extra si es variant seller (no rompe si no viene)
    const buyerName = order?.buyerName || order?.user?.name || order?.customerName || null;
    const buyerEmail = order?.buyerEmail || order?.user?.email || order?.customerEmail || null;

    const handleToggle = () => {
        const next = !open;
        setOpen(next);
        onOpenChange?.(next);
    }

    console.log(items)

    return (
        <div className="order-card admin-card">
            <div className="order-card__header">
                <div className="order-card__title">
                    <h3>Orden #{id}</h3>
                    <span className={`status-badge ${status}`}>{status}</span>
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

                    {variant === "SELLER" && (buyerName || buyerEmail) && (
                        <span className="order-meta">
                            <strong>
                                Comprador:
                            </strong> {buyerName || "—"}
                            {buyerEmail ? ` ${buyerEmail}` : "—"}
                        </span>
                    )}
                </div>
            </div>

            <div className="order-card__actions">
                <button
                    className="admin-button"
                    onClick={handleToggle}
                    aria-expanded={open}
                >
                    {open ? "Ocultar detalle" : "Ver detalle"}
                </button>
            </div>

            {open && (
                <div className="order-card__body">
                    <OrderItemsList items={items} currency={currency} />
                </div>
            )}
        </div>
    );
}