import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import OrderCard from "../../components/OrderComponents/OrderCard";
import "./Orders.css";
import { fetchUserOrders } from "../../redux/ordersSlice.js";

export default function OrdersPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // estado de auth desde Redux
  const logged = useSelector((state) => !!state.auth.token);

  const { orders, loading, err } = useSelector((state) => state.orders);

  // Cargar órdenes del usuario logueado
  useEffect(() => {
    if (!logged) return;
    dispatch(fetchUserOrders());
  }, [dispatch, logged]);

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
            <OrderCard key={o?.id ?? o?.orderId} order={o} />
          ))}
        </section>
      )}
    </main>
  );
}
