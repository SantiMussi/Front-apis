import { addToCart } from "../redux/cartSlice";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById as fetchProductByIdThunk } from "../redux/productsSlice";
import Swal from "sweetalert2";

import { GetRole, IsLoggedIn } from "../services/authService";
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
  } = useSelector((state) => state.products);

  const cartItems = useSelector((state) => state.cart?.items ?? []);

  const qtyInCart = product
    ? cartItems.find((it) => it.id === product.id)?.quantity ?? 0
    : 0;

  const remainingStock =
    typeof product?.stock === "number"
      ? Math.max(product.stock - qtyInCart, 0)
      : 0;

  useEffect(() => {
    if (!id) return;
    dispatch(fetchProductByIdThunk(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!product) return;

    // si no queda stock disponible, cantidad 0, si no, arrancamos en 1
    const initialQty = remainingStock > 0 ? 1 : 0;
    setQuantity(initialQty);
  }, [product, remainingStock]);

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
    const minQuantity = remainingStock > 0 ? 1 : 0;
    setQuantity((prevQuantity) => Math.max(minQuantity, prevQuantity - 1));
  };

  const increaseQuantity = () => {
    if (!product) return;
    setQuantity((prevQuantity) => {
      return Math.min(remainingStock, prevQuantity + 1);
    });
  };

  const isOutOfStock = remainingStock <= 0;
  const isAdmin = GetRole() === "ADMIN" || GetRole() === "SELLER";
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
    if (!IsLoggedIn()) {
      localStorage.setItem("lastPath", location.pathname);
      navigate("/login");
      return;
    }

    if (isOutOfStock) {
      Swal.fire({
        icon: "warning",
        title: "Sin stock disponible",
        text: "Ya agregaste la cantidad máxima de este producto.",
      });
      return;
    }

    const safeQuantity = Math.min(quantity, remainingStock);

    if (safeQuantity <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin stock disponible",
        text: "Ya no podés agregar más unidades de este producto.",
      });
      return;
    }

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

    const nextRemaining = remainingStock - safeQuantity;
    setQuantity(nextRemaining > 0 ? 1 : 0);
  };

  return (
    <div className="product-detail">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <div className="product-detail__layout">
        <div className="product-detail__media">
          <img ref={imgRef} src={product.base64img} alt={product.name} />
        </div>

        <div className="product-detail__info">
          <h2>{product.name}</h2>

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

          <p className="stock">
            Stock disponible: {product.stock}{" "}
            {qtyInCart > 0 && `(ya tenés ${qtyInCart} en el carrito)`}
          </p>

          <p className="stock">
            Talle: {product.size}
          </p>

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
                    disabled={isOutOfStock}
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
                    disabled={isOutOfStock || quantity >= remainingStock}
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
                    {isOutOfStock
                      ? "Sin stock"
                      : "Agregar al carrito"}
                  </span>

                  <span
                    className={`btn-label-overlay ${
                      added ? "visible" : ""
                    }`}
                  >
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
      </div>
    </div>
  );
};

export default ProductDetail;
