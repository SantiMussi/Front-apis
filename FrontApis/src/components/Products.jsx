import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


function Productos({ category = null }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    setLoading(true);

    const url = category
      ? `${BASE_URL}/products/category/${encodeURIComponent(category)}`
      : `${BASE_URL}/products`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setProductos(data)})
      .catch((err) => {
        setLoading(false);
        console.error("Error al cargar productos:", err)});
      
  }, [category]);  //se actualiza si cambia la categoría

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
            <span>USD${p.price}</span>
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
