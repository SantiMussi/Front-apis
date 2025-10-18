import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authHeader, isLoggedIn, onAuthChange } from "../../services/authService";
import "./Orders.css"

const BASE_URL = import.meta.env.VITE_API_URL;

/* utils */
function normalizePage(payload) {
    if (!payload) return { items: [], totalPages: 1, totalElements: 0 };
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

function statusClass(status) {
    const s = (status || "").toLowerCase();
    if (["paid", "completed", "approved"].includes(s)) return "ok";
    if (["shipped", "delivered", "sent"].includes(s)) return "ship";
    if (["pending", "processing"].includes(s)) return "pending";
    if (["cancelled", "canceled", "rejected", "failed"].includes(s)) return "bad";
    return "neutral";
}

function getItemThumb(item) {
    return (
        item?.image_preview_url ||
        item?.base64img ||
        item?.image ||
        item?.img ||
        item?.product?.base64img ||
        null
    );
}

/*  subcomponentes */
function OrderCard({ order }) {
    const [open, setOpen] = useState(false);

    const id = order?.id ?? order?.orderId ?? order?.code ?? "-";
    const status = order?.status ?? order?.state ?? "Pending";
    const createdAt = order?.createdAt || order?.date || order?.created_date;
    const total =
        order?.total ?? order?.totalAmount ?? order?.amount ?? order?.summary?.total ?? 0;
    const currency = order?.currency || "ARS";

    const items = Array.isArray(order?.items)
        ? order.items
        : Array.isArray(order?.orderItems)
            ? order.orderItems
            : [];

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
                        {new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(total)}
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
                    {items.length === 0 ? (
                        <div className="no-product compact">Orden sin ítems</div>
                    ) : (
                        <ul className="order-items">
                            {items.map((it, idx) => {
                                const name =
                                    it?.name || it?.productName || it?.product?.name || "Ítem";
                                const qty = it?.quantity ?? it?.qty ?? 1;
                                const price = it?.price ?? it?.unitPrice ?? it?.product?.price ?? 0;
                                const lineTotal = price * qty;
                                const img = getItemThumb(it);
                                return (
                                    <li key={idx} className="order-item">
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
                                                Cantidad: {qty} · Precio unidad:{" "}
                                                {new Intl.NumberFormat("es-AR", {
                                                    style: "currency",
                                                    currency,
                                                }).format(price)}
                                            </p>
                                        </div>
                                        <div className="order-item__total">
                                            {new Intl.NumberFormat("es-AR", {
                                                style: "currency",
                                                currency,
                                            }).format(lineTotal)}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

/* página  */
export default function OrdersPage() {
    const navigate = useNavigate();

    const [logged, setLogged] = useState(isLoggedIn());
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthChange(({ isLoggedIn }) => setLogged(isLoggedIn));
        return unsubscribe;
    }, []);

    const fetchOrders = useCallback(async () => {
        if (!logged) return;
        setLoading(true);
        setErr("");

        try {
            const res = await fetch(`${BASE_URL}/orders?page=${page}&size=${size}`, {
                headers: {
                    "Content-Type": "application/json",
                    ...authHeader(),
                },
                credentials: "include",
            });
            
            if (res.status === 204 || res.status === 404) {
                setOrders([]);
                setTotalPages(1);
                setErr("");
                setLoading(false);
                return;
            }

            if (!res.ok) {
                await res.text().catch(() => null);
                throw new Error("No pudimos cargar tus órdenes. Probá de nuevo más tarde.");
            }

            const data = await res.json();
            const n = normalizePage(data);
            setOrders(n.items);
            setTotalPages(n.totalPages || 1);
        } catch (e) {
            // Error de red u otro
            setErr(e?.message || "No pudimos cargar tus órdenes. Probá más tarde.");
            setOrders([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [logged, page, size]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    if (!logged) {
        return (
            <main className="orders-page">
                <header className="orders-header">
                    <h1>Tus órdenes</h1>
                    <p className="admin-subtitle">Necesitás iniciar sesión para ver tu historial.</p>
                </header>
                <div className="admin-alert error" style={{ marginTop: "1rem" }}>
                    No has iniciado sesión.
                </div>
                <div className="orders-pagination" style={{ justifyContent: "flex-start" }}>
                    <button className="admin-button primary" onClick={() => navigate("/login")}>
                        Iniciar sesión
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="orders-page">
            <header className="orders-header">
                <h1>Tus órdenes</h1>
                <p className="admin-subtitle">Historial de compras y estado de cada pedido</p>
            </header>

            {loading && (
                <div className="loading">
                    <div className="spinner" />
                    Cargando órdenes…
                </div>
            )}

            {!loading && err && <div className="admin-alert error">Ocurrió un problema: {err}</div>}

            {!loading && !err && orders.length === 0 && (
                <div className="no-product">No tenés órdenes aún</div>
            )}

            {!loading && !err && orders.length > 0 && (
                <section className="orders-list">
                    {orders.map((o) => (
                        <OrderCard key={o?.id ?? o?.orderId ?? crypto.randomUUID()} order={o} />
                    ))}
                </section>
            )}

            {!loading && totalPages > 1 && (
                <div className="orders-pagination">
                    <button
                        className="admin-button"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        Anterior
                    </button>
                    <span className="orders-page-indicator">
                        Página {page + 1} de {totalPages}
                    </span>
                    <button
                        className="admin-button"
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </main>
    );
}
