import { useEffect, useState } from "react";

function Productos() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error("Error al cargar productos:", err));
  }, []);

  return (
    <section className="productos">
      <h2 className="productos-neon">
        <span>NUESTROS PRODUCTOS</span>
      </h2>

      <div className="productos-grid">
        {productos.map((p) => (
          <div key={p.id} className="producto-card">
            <img src={p.image} alt={p.title} />
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <span>${p.price}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Productos;
