const CouponPanel = ({coupons = [], couponForm = {}, onChange, onSubmit, onDelete, loading = false}) => {
  const hasCoupons = Array.isArray(coupons) && coupons.length > 0;
  const { code = "", discount = "", expirationDate = "" } = couponForm;

  return (
    <section className="admin-section">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Cupones</h2>
          <span>{coupons.length} disponibles</span>
        </div>
        {hasCoupons ? (
          <div className="admin-list">
            {coupons.map((coupon) => (
              <article
                key={coupon.id ?? coupon.code}
                className="admin-item"
              >
                <div className="admin-item-main">
                  <h3>{coupon.code || `Cupón ${coupon.id ?? "-"}`}</h3>
                  <p className="admin-item-meta">
                    ID: {coupon.id ?? "-"} · Descuento: {" "}
                    {typeof coupon.discount === "number"
                      ? `${(coupon.discount * 100).toFixed(0)}%`
                      : coupon.discount ?? "-"}{" "}
                    · Expira: {coupon.expirationDate ?? "-"}
                  </p>
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
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-empty">No hay cupones registrados.</p>
        )}

        <form className="admin-form" onSubmit={onSubmit}>
          <h3>Nuevo cupón</h3>
          <label>
            Código
            <input
              type="text"
              name="code"
              value={code}
              onChange={onChange}
              placeholder="Ej: TEST"
              required
            />
          </label>
          <label>
            Descuento
            <input
              type="number"
              name="discount"
              value={discount}
              onChange={onChange}
              placeholder="0.2"
              min="0"
              max="1"
              step="0.01"
              required
            />
          </label>
          <label>
            Fecha de expiración
            <input
              type="date"
              name="expirationDate"
              value={expirationDate}
              onChange={onChange}
              required
            />
          </label>
          <button
            type="submit"
            className="admin-button primary"
            disabled={loading}
          >
            Crear cupón
          </button>
        </form>
      </div>
    </section>
  );
};

export default CouponPanel;