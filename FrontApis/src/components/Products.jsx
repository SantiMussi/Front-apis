import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


function Productos({ category = null }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const BASE_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    setLoading(true);

    const url = category
      ? `${BASE_URL}/product/category/${encodeURIComponent(category)}?page=${page}`
      : `${BASE_URL}/product?page=${page}`;

    fetch(url)
      .then(async (res) => {
        if(!res.ok){
          const text = await res.text();
          throw new Error(`${res.status} ${text || res.statusText}`)
        }
        return res.json();
      })
      .then((data) => {
        const items = Array.isArray(data.content) ? data.content : [];
        setProductos(items)
        setTotalPages(data.totalPages ?? 1);
      })
      .catch((err) => {
        console.error("Error al cargar productos: ", err);
        setProductos([]);
      })
      .finally(() => setLoading(false))
      
  }, [category, page]);  //se actualiza si cambia la categoría

    if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <section className="productos">
      <div className="productos-grid">
        {productos.map((p) => (
          <div key={p.id} className="producto-card">
            <img src={p.image} alt={p.title} />
            <h3>{p.title}</h3>
            <span>${p.price}</span>
            <p></p>
            <Link to={`/product/${p.id}`} className="detail-btn">
              Ver mas
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Productos;
