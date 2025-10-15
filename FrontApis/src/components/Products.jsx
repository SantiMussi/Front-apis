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
  }, [categoryId, page, BASE_URL]);

  if (loading) return (
    <div className="loading"><div className="spinner"></div><p>Cargando productos...</p></div>
  );

  const list = Array.isArray(productos) ? productos : [];
  return (
    <section className="productos">
      <div className="productos-grid">
        {list.map((p) => {
          return (
            <div key={p.id} className="producto-card">
              <img src={p.img} alt={p.name} />
              <h3>{p.name}</h3>
              <span>${p.price}</span>
              <Link to={`/product/${p.id}`} className="detail-btn">Ver más</Link>
            </div>
          );
        })}
        {list.length === 0 && (<div className="no-product">No hay productos en esta categoría.</div>)}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 0} onClick={() => setPage(p => p - 1)}>◀</button>
          <span>{page + 1} / {totalPages}</span>
          <button disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>▶</button>
        </div>
      )}
    </section>
  );
}
export default Productos;
