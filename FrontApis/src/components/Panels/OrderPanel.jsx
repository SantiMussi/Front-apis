import {useCallback, useEffect, useMemo, useState} from "react";
import {
  resolveOrderId,
  resolveOrderStatus,
} from "../../helpers/orderHelpers";
import { CANON_STATES, normalizeStatusToken } from "../../helpers/statusMap";
import OrderCard from "../OrderComponents/OrderCard";
import Collapsible from "../Collapsible/Collapsible"; // ojo con la ruta
import {useDispatch, useSelector} from "react-redux";
import {
  fetchOrders as fetchOrdersThunk,
  updateOrderStatus as updateOrderStatusThunk
} from "../../redux/ordersSlice.js";


export default function OrderPanel({ id = "orders", isOpen, onToggle, className = "" }) {
  // Data
  const [page, setPage] = useState(0);
  const {orders = [], loading, error} = useSelector((state) => state.orders);
  const dispatch = useDispatch();
  const size = 10;

  // Filtros locales
  const [statusFilter, setStatusFilter] = useState("");
  const [orderQuery, setOrderQuery] = useState("");

  // Notificación simple local
  const [toast, setToast] = useState(null);
  const notify = useCallback((type, message) => {
    setToast({ type, message });
    window.clearTimeout(notify.timeoutId);
    notify.timeoutId = window.setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      const action = await dispatch(fetchOrdersThunk());

      if (fetchOrdersThunk.rejected.match(action)) {
        notify("error", action?.error?.message || "No pudimos cargar las ordenes")
      }
    }
    loadOrders();
    return () => {
      if (notify.timeoutId) window.clearTimeout(notify.timeoutId);
    };
  }, [dispatch, notify]);

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

  const totalPages = useMemo(
      () => Math.max(1, Math.ceil(filteredOrders.length / size)),
      [filteredOrders.length, size]
  );

  const paginatedOrders = useMemo(() => {
    const start = page * size;
    return filteredOrders.slice(start, start + size);
  }, [filteredOrders, page, size]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter, orderQuery]);

  const handleOrderStatusChange = async(orderId, nextToken) => {
    try {
      const action = await dispatch(updateOrderStatusThunk({orderId, status: nextToken}));

      if (updateOrderStatusThunk.fulfilled.match(action)) {
        notify("success", `Estado de la orden #${orderId} → ${nextToken}`)
      } else {
        throw new Error(action?.error?.message || "No se pudo actualizar el estado")
      }
    } catch (err) {
      notify("error", err?.message || "Error al actualizar el estado");
    }
  };

  const rightInfo = loading ? "—" : `${paginatedOrders.length} en esta página`;

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

        {!loading && error && <div className="admin-alert error">{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div className="no-product">Aún no hay órdenes</div>
        )}

        {!loading && !error && filteredOrders.length > 0 && (
          <section className="orders-list">
            {paginatedOrders.map((o) => (
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
