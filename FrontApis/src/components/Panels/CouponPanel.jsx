import CouponList from "./CouponList";

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
        
        <CouponList coupons={coupons} onDelete={onDelete} loading={loading} />              

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