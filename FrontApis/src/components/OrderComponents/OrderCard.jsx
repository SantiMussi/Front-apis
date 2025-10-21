import { useMemo, useState } from "react";
import OrderItemsList from "./OrderItemsList";
import {
  getOrderItems,
  resolveOrderCurrency,
  resolveOrderCreatedAt,
  resolveOrderId,
  resolveOrderStatus,
  resolveOrderTotal,
} from "../../helpers/orderHelpers";
import { CANON_STATES, normalizeStatusToken } from "../../helpers/statusMap";

const STATUS_OPTIONS = CANON_STATES.map((s) => ({
  token: s,
  label: s.replace(/_/g, " "),
}));

function formatCurrency(value, currency) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
  }).format(value);
}

export default function OrderCard({
  order,
  variant = "buyer",
  onOpenChange,
  onStatusChange,
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const id = resolveOrderId(order);
  const createdAt = resolveOrderCreatedAt(order);
  const total = resolveOrderTotal(order);
  const currency = resolveOrderCurrency(order);
  const items = useMemo(() => getOrderItems(order), [order]);
  const buyerId = order?.userId;

  // status canónico (ES)
  const initialCanon = normalizeStatusToken(resolveOrderStatus(order));
  const [status, setStatus] = useState(initialCanon);

  const handleStatusChange = async (e) => {
    const nextCanon = e.target.value;
    setStatus(nextCanon);
    if (!onStatusChange) return;

    setSaving(true);
    try {
      // el back espera ES: mandamos tal cual
      await onStatusChange(id, nextCanon);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
  };

  console.log(order)
  return (
    <div className="order-card admin-card">
      <div className="order-card__header">
        <div className="order-card__title">
          <h3>Orden #{id}</h3>

          {/* Badge de estado (ES) */}
          <span className={`status-badge ${status.toLowerCase()}`}>
            {status.replace(/_/g, " ")}
          </span>

          {variant === "ADMIN" && (
            <>
              <span>Editar estado del producto</span>
              <div className="vf-select-wrap">
                <select
                  className="vf-select"
                  value={status}
                  onChange={handleStatusChange}
                  disabled={saving}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.token} value={opt.token}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Meta */}
        <div className="order-card__meta">
          <span className="order-meta">
            <strong>Fecha:</strong>{" "}
            {createdAt}
          </span>
          <span className="order-meta">
            <strong>Ítems:</strong> {items.length}
          </span>
          <span className="order-meta">
            <strong>Total:</strong> {formatCurrency(total, currency)}
          </span>
          {variant === "ADMIN" && buyerId && (
            <span className="order-meta">
              <strong>Id de comprador:</strong> {` ${buyerId}`}
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
