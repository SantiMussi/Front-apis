import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";

import { getRole, isLoggedIn } from "../services/authService";
import { formatCurrency, resolveItemPricing } from "../helpers/pricing";
import { flyImageToCart } from "../utils/flyToCart";

const ProductDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const imgRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${BASE_URL}/product/${id}`);
        const data = await response.json();
        setProduct(data);
        setQuantity(data.stock > 0 ? 1 : 0);
      } catch (error) {
        //console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, BASE_URL]);

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

  const decreaseQuantity = () => {
    const minQuantity =
      typeof product?.stock === "number" && product.stock <= 0 ? 0 : 1;

    setQuantity((prevQuantity) => Math.max(minQuantity, prevQuantity - 1));
  };

  const increaseQuantity = () => {
    if (!product) return;

    setQuantity((prevQuantity) => {
      if (typeof product.stock !== "number") {
        return prevQuantity + 1;
      }

      return Math.min(product.stock, prevQuantity + 1);
    });
  };

  const isOutOfStock =
    typeof product?.stock === "number" ? product.stock <= 0 : false;
  const isAdmin = getRole() === "ADMIN" || getRole() === 'SELLER';
  const { unitPrice, compareAtPrice, hasDiscount, discountRate } =
    resolveItemPricing(product);

  const handleOpenVirtualFitter = () => {
    if (!product) return;
    const productId = product.id;
    if (productId == null) {
      navigate("/virtual-fitter");
      return;
    }

    navigate(`/virtual-fitter?productId=${encodeURIComponent(productId)}`);
  };

  const handleAddToCart = () => {
    if (!isLoggedIn()) {
      localStorage.setItem("lastPath", location.pathname);
      navigate("/login");
      return;
    }
    if (isOutOfStock) return;
    // Agrega el producto al carrito con la cantidad seleccionada y talle si aplica
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      size: product.size,
      base64img: product.base64img,
      description: product.description,
      categoryName: product.categoryName,
      quantity,
    }));
    // Lógica real de carrito


        // Botón verde temporalmente
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);

    // Animación de vuelo de imagen
    flyImageToCart(imgRef.current);

    //Toast de confirmación
    Swal.fire({
      toast: true,
      position: "top-right",
      icon: "success",
      title: "Producto agregado al carrito",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
  };

  return (
      <div className="product-detail">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Volver
      </button>

        <h2>{product.name}</h2>

      <img
        ref={imgRef}
        src={product.base64img}
        alt={product.name}
      />

        <p className="description">{product.description}</p>

        <div className="price-block product-detail__price">
          <span className="price-current">{formatCurrency(unitPrice)}</span>
          {hasDiscount && (
              <>
            <span className="price-original">
              {formatCurrency(compareAtPrice)}
            </span>
            <span className="price-tag">
              -{Math.round(discountRate * 100)}%
            </span>
              </>
          )}
        </div>

        <p className="stock">Stock disponible: {product.stock}</p>

        <div className="product-detail__actions">
          {!isAdmin && (
              <div className="cart-action-bar">
            <div
              className="quantity-control"
              aria-label="Selector de cantidad"
            >
                  <button
                      type="button"
                      className="quantity-button"
                      onClick={decreaseQuantity}
                      aria-label="Disminuir cantidad"
                  >
                    -
                  </button>
              <span className="quantity-display" aria-live="polite">
                {quantity}
              </span>
                  <button
                      type="button"
                      className="quantity-button"
                      onClick={increaseQuantity}
                      aria-label="Aumentar cantidad"
                      disabled={
                        typeof product.stock === "number"
                            ? quantity >= product.stock
                            : false
                      }
                  >
                    +
                  </button>
                </div>

                <button
                    type="button"
              className={`add-to-cart-button ${added ? "added" : ""}`}
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                >
              {/* Texto base (el MÁS largo) que define el ancho SIEMPRE */}
              <span className={`btn-label-base ${added ? "hidden" : ""}`}>
                  Agregar al carrito
              </span>

              {/* Texto de estado agregado, superpuesto */}
              <span className={`btn-label-overlay ${added ? "visible" : ""}`}>
                Agregado ✓
              </span>
                </button>
              </div>
          )}

          <button
              type="button"
              className="virtual-fitter-button"
              onClick={handleOpenVirtualFitter}
          >
            Probar en el probador virtual
          </button>
        </div>
      </div>
  );
};

export default ProductDetail;
