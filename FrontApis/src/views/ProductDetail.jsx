import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${BASE_URL}/product/${id}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

    if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (!product) {
    return <div className="error">Producto no encontrado</div>;
  }

  return (
    <div className="product-detail">
      <button className="back-button" onClick={() => navigate(-1)}>← Volver</button>
      <h2>{product.name}</h2>
      <img src={product.image} alt={product.name} />
      <p className="description">{product.description}</p>
      <p className="price">Precio: ${product.price}</p>
      {product.discount > 0 && <p>Precio: ${(product.price - (product.price * product.discount).toFixed(2))}</p>}
      <p className="stock">Stock disponible: {product.stock}</p>
      <input
      type="number"
      />
      <button className="cta-button">Agregar al carrito</button>
    </div>
  );
};

export default ProductDetail;
