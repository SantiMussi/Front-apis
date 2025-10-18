import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


function Productos({ categoryId = null }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const BASE_URL = import.meta.env.VITE_API_URL;

  //Reseteo de la pag para cada vez q cambia la cat
  useEffect(() => {
    setPage(0);
  }, [categoryId]);

  useEffect(() => {
    setLoading(true);
    const fetchAll = async () => {
      const res = await fetch(`${BASE_URL}/product`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const items = Array.isArray(data?.content) ? data.content : [];
      setProductos(items);
    };


    const fetchByCategory = async () => {
      const res = await fetch(`${BASE_URL}/categories/${categoryId}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const items = Array.isArray(data?.product) ? data.product : [];
      setProductos(items);
    };

    (categoryId == null ? fetchAll() : fetchByCategory())
      .catch((e) => {
        console.error("Error al cargar productos:", e);
        setProductos([]);
      })
      .finally(() => setLoading(false));
  }, [categoryId, BASE_URL]);

  if (loading) return (
    <div className="loading"><div className="spinner"></div><p>Cargando productos...</p></div>
  );

  const list = Array.isArray(productos) ? productos : [];
  return (
    <section className="productos">
      <div className="productos-grid">
        {list.map((p) => {
          const priceValue = Number(p.price ?? 0);
          const discountValue = Number(p.discount ?? 0);
          const hasDiscount = Number.isFinite(discountValue) && discountValue > 0;
          const finalPrice = hasDiscount ? priceValue * (1 - discountValue) : priceValue;

          return (
            <div key={p.id} className="producto-card">
              <img src={p.base64img} alt={p.name} />
              <h3>{p.name}</h3>
              <div className="price-block">
                {/* Precio actual con descuento */}
                <span className="price-current">
                  ${finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>

                {/* Si tiene descuento, mostrar original y porcentaje arriba */}
                {hasDiscount && (
                  <div className="price-discount-details">
                    <span className="price-original">
                      ${priceValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="price-tag">-{Math.round(discountValue * 100)}%</span>
                  </div>
                )}
              </div>
              <Link to={`/product/${p.id}`} className="detail-btn">Ver más</Link>
            </div>
          );
        })}
        {list.length === 0 && (<div className="no-product">No hay productos en esta categoría.</div>)}
      </div>
    </section>
  );
}
export default Productos;
