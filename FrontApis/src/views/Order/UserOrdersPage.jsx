import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, onAuthChange, authHeader } from "../../services/authService";
import OrderCard from "../../components/OrderComponents/OrderCard";
import "./Orders.css";

export default function OrdersPage() {
  const navigate = useNavigate();

  const [logged, setLogged] = useState(isLoggedIn());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Escuchar cambios de login hasta pasar auth a Redux
  useEffect(() => {
    const unsubscribe = onAuthChange(({ isLoggedIn: nextLogged }) =>
      setLogged(nextLogged)
    );
    return unsubscribe;
  }, []);

  // Cargar órdenes del usuario logueado
  useEffect(() => {
    const fetchOrders = async () => {
      if (!logged) {
        setOrders([]);
        setErr("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErr("");

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/users/me/orders`,
          {
            headers: {
              "Content-Type": "application/json",
              ...authHeader(),
            },
            credentials: "include",
          }
        );

        // 401: sesión inválida
        if (res.status === 401) {
          setOrders([]);
          setErr("");
          setLoading(false);
          return;
        }

        // 204/404: sin órdenes
        if (res.status === 204 || res.status === 404) {
          setOrders([]);
          setErr("");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          await res.text().catch(() => null);
          throw new Error("No pudimos cargar tus órdenes. Probá más tarde.");
        }

        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
          ? data.content
          : [];

        setOrders(list);
      } catch (e) {
        setErr(
          e?.message || "No pudimos cargar tus órdenes. Probá más tarde."
        );
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [logged]);

  // Si no está logueado
  if (!logged) {
    return (
      <main className="orders-page">
        <header className="orders-header">
          <h1>Tus órdenes</h1>
          <p className="admin-subtitle">
            Necesitás iniciar sesión para ver tu historial.
          </p>
        </header>
        <div className="admin-alert error" style={{ marginTop: "1rem" }}>
          No has iniciado sesión.
        </div>
        <div
          className="orders-pagination"
          style={{ justifyContent: "flex-start" }}
        >
          <button
            className="admin-button primary"
            onClick={() => navigate("/login")}
          >
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
        <p className="admin-subtitle">
          Historial de compras y estado de cada pedido
        </p>
      </header>

      {loading && (
        <div className="loading">
          <div className="spinner" />
          Cargando órdenes…
        </div>
      )}

      {!loading && err && (
        <div className="admin-alert error">
          Ocurrió un problema: {err}
        </div>
      )}

      {!loading && !err && orders.length === 0 && (
        <div className="no-product">No tenés órdenes aún</div>
      )}

      {!loading && !err && orders.length > 0 && (
        <section className="orders-list">
          {orders.map((o) => (
            <OrderCard
              key={o?.id ?? o?.orderId}
              order={o}
            />
          ))}
        </section>
      )}
    </main>
  );
}
