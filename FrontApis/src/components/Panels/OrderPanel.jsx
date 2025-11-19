import { useEffect, useMemo, useState } from "react";
import { authHeader } from "../../services/authService";
import {
  normalizePage,
  resolveOrderId,
  resolveOrderStatus,
} from "../../helpers/orderHelpers";
import { CANON_STATES, normalizeStatusToken } from "../../helpers/statusMap";
import OrderCard from "../OrderComponents/OrderCard";
import Collapsible from "../Collapsible/Collapsible";
import {useSelector} from "react-redux"; // ojo con la ruta

const BASE_URL = import.meta.env.VITE_API_URL;

export default function OrderPanel({ id = "orders", isOpen, onToggle, className = "" }) {
  // Data
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const selector = useSelector();

  // Filtros locales
  const [statusFilter, setStatusFilter] = useState("");
  const [orderQuery, setOrderQuery] = useState("");

  // Notificación simple local
  const [toast, setToast] = useState(null);
  const notify = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(notify.timeoutId);
    notify.timeoutId = window.setTimeout(() => setToast(null), 3500);
  };

  // Carga paginada de órdenes
  const fetchOrders = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${BASE_URL}/orders`, {
        headers: { "Content-Type": "application/json", ...authHeader(selector) },
        credentials: "include",
      });

      if (res.status === 401 || res.status === 204 || res.status === 404) {
        setOrders([]);
        setTotalPages(1);
        setErr("");
        return;
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(txt || "No pudimos cargar las órdenes");
      }

      const data = await res.json();
      const n = normalizePage(data);
      const items = Array.isArray(n.items) ? n.items : [];
      setOrders(items);
      setTotalPages(n.totalPages || 1);
      setErr("");
    } catch (e) {
      setErr(e?.message || "No pudimos cargar las órdenes");
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    return () => {
      if (notify.timeoutId) window.clearTimeout(notify.timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Lista de estados disponibles (canónicos ES)
  const availableStatuses = useMemo(() => CANON_STATES, []);

  // Filtro local
  const filteredOrders = useMemo(() => {
    const q = (orderQuery ?? "").trim();
    const selectedCanon = (statusFilter ?? "").trim().toUpperCase();

    return orders.filter((o) => {
      const idStr = String(resolveOrderId(o));
      const stCanon = normalizeStatusToken(resolveOrderStatus(o));
      const matchesNumber = q === "" ? true : idStr.includes(q);
      const matchesStatus =
        selectedCanon === "" ? true : stCanon === selectedCanon;
      return matchesNumber && matchesStatus;
    });
  }, [orders, orderQuery, statusFilter]);

  // Update optimista de estado (el back espera ES)
  const handleOrderStatusChange = async (orderId, nextToken) => {
    const prev = orders;
    setOrders((old) =>
      old.map((o) =>
        (o?.id ?? o?.orderId) === orderId ? { ...o, status: nextToken } : o
      )
    );

    try {
      const res = await fetch(
        `${BASE_URL}/orders/${orderId}/status?status=${encodeURIComponent(
          nextToken
        )}`,
        {
          method: "PUT",
          headers: { ...authHeader(selector) },
          credentials: "include",
        }
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "No se pudo actualizar el estado");
      }

      notify("success", `Estado de la orden #${orderId} → ${nextToken}`);
    } catch (err) {
      setOrders(prev);
      notify("error", err?.message || "Error al actualizar el estado");
      throw err;
    }
  };

  const rightInfo = loading ? "—" : `${filteredOrders.length} en esta página`;

  return (
    <section className="admin-section">
      <Collapsible
        id={id}
        title="Órdenes"
        rightInfo={rightInfo}
        isOpen={isOpen}
        onToggle={onToggle}
        className={className}
      >
        <div
          className="admin-form"
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="admin-label">Filtrar por estado</span>
            <select
              className="admin-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos</option>
              {availableStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="admin-label">Buscar por número de orden</span>
            <input
              className="admin-input"
              type="text"
              placeholder="#0234"
              value={orderQuery}
              onChange={(e) =>
                setOrderQuery(e.target.value.replace(/[^\d]/g, ""))
              }
            />
          </label>

          {(statusFilter || orderQuery) && (
            <button
              type="button"
              className="admin-button"
              onClick={() => {
                setStatusFilter("");
                setOrderQuery("");
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {toast && (
          <div
            className={`admin-alert ${
              toast.type === "error" ? "error" : "success"
            }`}
            style={{ marginBottom: 12 }}
          >
            {toast.message}
          </div>
        )}

        {loading && <div className="admin-loading">Cargando órdenes...</div>}

        {!loading && err && <div className="admin-alert error">{err}</div>}

        {!loading && !err && orders.length === 0 && (
          <div className="no-product">Aún no hay órdenes</div>
        )}

        {!loading && !err && filteredOrders.length > 0 && (
          <section className="orders-list">
            {filteredOrders.map((o) => (
              <OrderCard
                key={o?.id ?? o?.orderId ?? crypto.randomUUID()}
                order={o}
                variant="ADMIN"
                onStatusChange={handleOrderStatusChange}
              />
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
      </Collapsible>
    </section>
  );
}
