import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/productsSlice";

function Products({
  categoryId = null,
  query = "",
  minPrice = "",
  maxPrice = "",
}) {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ categoryId }));
  }, [categoryId, dispatch]);

  const list = Array.isArray(products) ? products : [];

  // 🔍 FILTRO LOCAL: nombre + rango de precio (sobre el precio final con descuento)
  const filtered = useMemo(() => {
    const q = (query ?? "").trim().toLowerCase();

    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    return list.filter((p) => {
      // nombre
      const name = String(p.name ?? "").toLowerCase();
      const matchesName = q === "" ? true : name.includes(q);

      // precio final (con descuento si tiene)
      const priceValue = Number(p.price ?? 0);
      const discountValue = Number(p.discount ?? 0);
      const hasDiscount =
        Number.isFinite(discountValue) && discountValue > 0;
      const finalPrice = hasDiscount
        ? priceValue * (1 - discountValue)
        : priceValue;

      const matchesMin = min == null || !Number.isFinite(min) ? true : finalPrice >= min;
      const matchesMax = max == null || !Number.isFinite(max) ? true : finalPrice <= max;

      return matchesName && matchesMin && matchesMax;
    });
  }, [list, query, minPrice, maxPrice]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <section className="productos">
      <div className="productos-grid">
        {filtered.map((p) => {
          const priceValue = Number(p.price ?? 0);
          const discountValue = Number(p.discount ?? 0);
          const hasDiscount =
            Number.isFinite(discountValue) && discountValue > 0;
          const finalPrice = hasDiscount
            ? priceValue * (1 - discountValue)
            : priceValue;

          return (
            <div key={p.id} className="producto-card">
              <img src={p.base64img} alt={p.name} />
              <h3>{p.name}</h3>
              <div className="price-block">
                <span className="price-current">
                  $
                  {finalPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>

                {hasDiscount && (
                  <div className="price-discount-details">
                    <span className="price-original">
                      $
                      {priceValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="price-tag">
                      -{Math.round(discountValue * 100)}%
                    </span>
                  </div>
                )}
              </div>
              <Link to={`/product/${p.id}`} className="detail-btn">
                Ver más
              </Link>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="no-product">
            {list.length === 0
              ? "No hay productos en esta categoría."
              : "No hay productos que coincidan con los filtros."}
          </div>
        )}
      </div>
    </section>
  );
}

export default Products;
