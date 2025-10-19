import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authHeader, hasRole, isLoggedIn, onAuthChange } from "../services/authService";
import useOrdersPager from "../hooks/useOrdersPager";
import OrdersList from "../components/OrderComponents/OrdersList";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function SellerOrdersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const size = 10;

  const [logged, setLogged] = useState(isLoggedIn());
  useState(() => onAuthChange(({ isLoggedIn }) => setLogged(isLoggedIn)));

  // Guard de rol
  if (!logged) {
    return (
      <main className="orders-page">
        <header className="orders-header"><h1>Órdenes recibidas</h1></header>
        <div className="admin-alert error" style={{ marginTop: "1rem" }}>Iniciá sesión para continuar.</div>
        <div className="orders-pagination" style={{ justifyContent: "flex-start" }}>
          <button className="admin-button primary" onClick={() => navigate("/login")}>Iniciar sesión</button>
        </div>
      </main>
    );
  }
  if (!hasRole("SELLER","ADMIN")) {
    return (
      <main className="orders-page">
        <header className="orders-header"><h1>Órdenes recibidas</h1></header>
        <div className="admin-alert error" style={{ marginTop: "1rem" }}>
          No tenés permisos de vendedor.
        </div>
      </main>
    );
  }

  // TODO: AJUSTAR DSP AL ENDPOINT DEL VENDEDOR
  const fetchFn = async (p, s) => {
    const res = await fetch(`${BASE_URL}/orders/seller?page=${p}&size=${s}`, {
      headers: { "Content-Type": "application/json", ...authHeader() },
      credentials: "include",
    });
    let payload = null;
    if (res.status !== 204 && res.status !== 404) {
      try { payload = await res.json(); } catch { payload = null; }
    }
    return { payload, status: res.status };
  };

  const { orders, totalPages, loading, err } = useOrdersPager(fetchFn, { page, size });

  return (
    <OrdersList
      title="Órdenes recibidas"
      subtitle="Pedidos que recibiste como vendedor"
      loading={loading}
      err={err}
      orders={orders}
      totalPages={totalPages}
      page={page}
      setPage={setPage}
      variant="seller"
    />
  );
}
