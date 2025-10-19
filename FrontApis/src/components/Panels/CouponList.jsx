const formatCouponMeta = (coupon) => {
  const idValue = coupon.id ?? "-";
  const discountValue =
    typeof coupon.discount === "number"
      ? `${Math.round(coupon.discount * 100)}%`
      : coupon.discount ?? "-";
  const expirationValue = coupon.expirationDate ?? "-";

  return `ID: ${idValue} · Descuento: ${discountValue} · Expira: ${expirationValue}`;
};

const CouponList = ({ coupons = [], onDelete, loading = false }) => {
  if (!Array.isArray(coupons) || coupons.length === 0) {
    return <p className="admin-empty">No hay cupones registrados.</p>;
  }

  return (
    <ul className="admin-list coupons">
      {coupons.map((coupon) => (
        <li key={coupon.id ?? coupon.code} className="admin-item">
          <div className="admin-item-main">
            <h3>{coupon.code || `Cupón ${coupon.id ?? "-"}`}</h3>
            <p className="admin-item-meta">{formatCouponMeta(coupon)}</p>
          </div>
          <div className="admin-item-actions">
            <button
              type="button"
              className="admin-button danger"
              onClick={() => onDelete?.(coupon.id)}
              disabled={loading}
            >
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default CouponList;