import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, isLoggedIn, onAuthChange } from "../../services/authService";
import { getOrdersByUser, getUserOrders } from "../../services/checkoutService";
import OrderCard from "../../components/OrderComponents/OrderCard";
import { normalizePage } from "../../helpers/orderHelpers";
import "./Orders.css";

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
      const user = await getCurrentUser();
      const userId = user?.id ?? null;
      if (!userId) throw new Error("No pudimos identificar al usuario autenticado.");

      let payload = null;

      // Intento con getUserOrders
      try {
        payload = await getUserOrders(userId, { page, size });
      } catch (e1) {
        const m = e1?.message || "";
        // Si el service lanza por 404/204, tratamos como vacío
        if (e1?.status === 404 || e1?.status === 204 || /404/.test(m) || /No\s*Content/i.test(m)) {
          setOrders([]);
          setTotalPages(1);
          setErr("");
          setLoading(false);
          return;
        }
        //Fallback opcional a getOrdersByUser (si existe)
        try {
          payload = await (getOrdersByUser ? getOrdersByUser(userId, { page, size }) : Promise.reject(e1));
        } catch (e2) {
          const m2 = e2?.message || "";
          if (e2?.status === 404 || e2?.status === 204 || /404/.test(m2) || /No\s*Content/i.test(m2)) {
            setOrders([]);
            setTotalPages(1);
            setErr("");
            setLoading(false);
            return;
          }
          // cualquier otro error real
          throw e2;
        }
      }

      // normalizar y setear
      const n = normalizePage(payload);
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
