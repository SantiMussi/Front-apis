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
    onStatusChange,
}) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false)


    const id = resolveOrderId(order);
    //const [status, setStatus] = useState(resolveOrderStatus(order))
    const createdAt = resolveOrderCreatedAt(order);
    const total = resolveOrderTotal(order);
    const currency = resolveOrderCurrency(order);
    const items = useMemo(() => getOrderItems(order), [order]);
    const buyerId = order?.userId


    const handleStatusChange = async (e) => {
        const next = e.target.value;
        setStatus(next);
        if (!onStatusChange) return;

        setSaving(true);

        try {
            await onStatusChange(id, next); //GodPage hace el put + notify y rollback si falla
        } finally {
            setSaving(false);
        }
    }

    const handleToggle = () => {
        const next = !open;
        setOpen(next);
        onOpenChange?.(next);
    }

    console.log(items)


    const STATUS_OPTIONS = [
        { token: "PENDIENTE", label: "PENDIENTE" },
        { token: "EN_PROGRESO", label: "EN PROGRESO" },
        { token: "ENVIADO", label: "ENVIADO" },
        { token: "COMPLETADO", label: "COMPLETADO" },
    ];

    // Si order.status viene "EN PROGRESO", normalizamos a token:
    const toToken = (s) => (s || "").toUpperCase().replace(/\s+/g, "_");
    const toLabel = (t) => t.replace(/_/g, " ");

    const [status, setStatus] = useState(toToken(resolveOrderStatus(order)));


    return (
        <div className="order-card admin-card">
            <div className="order-card__header">
                <div className="order-card__title">
                    <h3>Orden #{id}</h3>

                    {/* Estado */}
                    <span className={`status-badge ${status.toLowerCase()}`}>{toLabel(status)}</span>

                    {variant === "ADMIN" && (
                        <><span>Editar estado del producto</span>
                            <div className="vf-select-wrap">

                                <select
                                    className="vf-select"
                                    value={status}
                                    onChange={async (e) => {
                                        const nextToken = e.target.value;
                                        setStatus(nextToken);
                                        setSaving(true);
                                        try { await onStatusChange?.(id, nextToken); }
                                        finally { setSaving(false); }
                                    }}
                                    disabled={saving}
                                >
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.token} value={opt.token}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>

                {/* meta */}
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

                    {variant === "ADMIN" && (buyerId) && (
                        <span className="order-meta">
                            <strong>
                                Id de comprador:
                            </strong>
                            {buyerId ? ` ${buyerId}` : "—"}
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