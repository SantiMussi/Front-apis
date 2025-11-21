import { addToCart } from "../redux/cartSlice";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById as fetchProductByIdThunk } from "../redux/productsSlice";
import Swal from "sweetalert2";

import { getRole, isLoggedIn } from "../services/authService";
import { formatCurrency, resolveItemPricing } from "../helpers/pricing";
import { flyImageToCart } from "../utils/flyToCart";

const ProductDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { id } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const imgRef = useRef(null);
  const {
    currentProduct: product,
    currentProductLoading: loading,
    currentProductError: productError,
  } = useSelector((state) => state.products)

  useEffect(() => {
    if(!id) return;
    dispatch(fetchProductByIdThunk(id));
  }, [dispatch, id])

  useEffect(() => {
    if (!product) return;
    const initialQty =
      typeof product.stock === "number" && product.stock > 0 ? 1 : 0;
    setQuantity(initialQty);
  }, [product]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (productError) {
    return <div className="error">{productError}</div>;
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
      // lock en el máximo stock
      return Math.min(product.stock, prevQuantity + 1);
    });
  };

  const isOutOfStock =
    typeof product?.stock === "number" ? product.stock <= 0 : false;
  const isAdmin = getRole() === "ADMIN" || getRole() === "SELLER";
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

    const safeQuantity =
      typeof product.stock === "number"
        ? Math.min(quantity, product.stock)
        : quantity;

    if (safeQuantity <= 0) return;

    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        size: product.size,
        base64img: product.base64img,
        description: product.description,
        categoryName: product.categoryName,
        quantity: safeQuantity,
        stock: product.stock,
      })
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1200);

    flyImageToCart(imgRef.current);

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

      <img ref={imgRef} src={product.base64img} alt={product.name} />

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
              <span className={`btn-label-base ${added ? "hidden" : ""}`}>
                Agregar al carrito
              </span>

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