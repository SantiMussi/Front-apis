import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {isLoggedIn, onAuthChange, authHeader } from "../../services/authService";
import OrderCard from "../../components/OrderComponents/OrderCard";
import { normalizePage } from "../../helpers/orderHelpers";
import "./Orders.css";
import {useSelector} from "react-redux";

export default function OrdersPage() {
    const navigate = useNavigate();
    const selector = useSelector();
    const [logged, setLogged] = useState(isLoggedIn(selector));
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthChange(({ isLoggedIn: nextLogged }) => setLogged(nextLogged));
        return unsubscribe;
    }, []);

    const fetchOrders = useCallback(async () => {
        if (!logged) {
            setOrders([]);
            setTotalPages(1);
            setErr("");
            setLoading(false);
            return;
        }
        setLoading(true);
        setErr("");

        try {
            // Intento con paginado
            let res = await fetch(
                `${import.meta.env.VITE_API_URL}/users/me/orders?page=${page}&size=${size}`,
                {
                    headers: { "Content-Type": "application/json", ...authHeader(selector) },
                    credentials: "include",
                }
            );

            // si el backend no soporta page/size, probá sin query
            if (res.status === 400 || res.status === 404) {
                res = await fetch(`${import.meta.env.VITE_API_URL}/users/me/orders`, {
                    headers: { "Content-Type": "application/json", ...authHeader(selector) },
                    credentials: "include",
                });
            }

            // 401: sesión inválida 
            if (res.status === 401) {
                setOrders([]); setTotalPages(1); setErr(""); setLoading(false); return;
            }
            // 204/404: sin órdenes 
            if (res.status === 204 || res.status === 404) {
                setOrders([]); setTotalPages(1); setErr(""); setLoading(false); return;
            }
            if (!res.ok) {
                await res.text().catch(() => null);
                throw new Error("No pudimos cargar tus órdenes. Probá más tarde.");
            }

            const data = await res.json();
            const n = normalizePage(data);
            setOrders(Array.isArray(n.items) ? n.items : []);
            setTotalPages(n.totalPages || 1);
        } catch (e) {
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
