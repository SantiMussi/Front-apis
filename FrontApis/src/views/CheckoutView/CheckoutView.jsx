import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchCouponByCode } from "../../redux/couponsSlice";
import { fetchOrderById, purchaseOrder } from "../../redux/ordersSlice";
import { fetchCurrentUser } from "../../redux/usersSlice";
import {clearCart} from '../../redux/cartSlice'
import "./checkout.css";
import { formatCurrency, resolveItemPricing } from "../../helpers/pricing";
import { normalizeBase64Image } from "../../helpers/image";

const shippingOptions = [
  {
    id: "EXPRESS",
    title: "Envío Express",
    eta: "24-48 hs",
    description: "Entrega prioritaria en centros urbanos",
    price: 8500.00,
  },
  {
    id: "STANDARD",
    title: "Envío Standard",
    eta: "3-5 días",
    description: "Envío regular con seguimiento",
    price: 6000.00,
  },
  {
    id: "PICKUP",
    title: "Retiro en tienda",
    eta: "Disponible en 2 hs",
    description: "Retirá gratis por nuestra tienda",
    price: 0,
  },
];

const paymentMethods = [
  {
    id: "CREDITO",
    title: "Tarjeta de crédito",
    description: "Visa, Mastercard, AMEX en hasta 12 cuotas",
  },
  {
    id: "DEBITO",
    title: "Tarjeta de débito",
    description: "Acreditación inmediata",
  },
  {
    id: "TRANSFERENCIA",
    title: "Transferencia o depósito",
    description: "Mostraremos los datos bancarios una vez confirmes la compra",
  },
];

const CheckoutView = () => {
  const navigate = useNavigate();
  const location = useLocation(); // useLocation para que el programa guarde de donde venimos (ruta)
  const dispatch = useDispatch();
  const { couponByCodeLoading: couponLoading } = useSelector(
    (state) => state.coupons
  );
  const { currentUser } = useSelector((state) => state.users);
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  const cartItems = useSelector((state) => state.cart.items);

  const [items, setItems] = useState(() => {
    return location.state?.items ?? cartItems ?? [];
  });


  useEffect(() => {
    if(!cartItems || cartItems.length === 0){
      setItems([]);
    } else{
      setItems(location.state?.items ?? cartItems);
    }
  }, [cartItems, location.state])
  
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    // Ajusta el ancho base de .shipping-option__info según el texto más largo
    const updateShippingInfoWidth = () => {
      const els = document.querySelectorAll(".shipping-option__info");
      let max = 0;
      els.forEach((el) => {
        // usar scrollWidth para incluir contenido que pueda envolver
        const w = Math.ceil(el.scrollWidth);
        if (w > max) max = w;
      });
      // añadir un pequeño padding para evitar cortes exactos
      if (max > 0) {
        document.documentElement.style.setProperty(
          "--shipping-info-width",
          `${max + 8}px`
        );
      } else {
        document.documentElement.style.removeProperty("--shipping-info-width");
      }
    };

    // calcular al montar y cuando cambie el tamaño de ventana
    updateShippingInfoWidth();
    window.addEventListener("resize", updateShippingInfoWidth);
    // si hay cambios dinámicos en el DOM, reintentar después de 100ms
    const t = setTimeout(updateShippingInfoWidth, 100);

    return () => {
      window.removeEventListener("resize", updateShippingInfoWidth);
      clearTimeout(t);
    };
  }, []);

  // 
  useEffect(() => {
    if (location.state?.couponCode) {
      setCouponCode(location.state.couponCode);
    }
  }, [location.state]);

  const { subtotal, savings, totalItems } = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const quantity = Number(item.quantity ?? 1) || 1;
        const { unitPrice, compareAtPrice, hasDiscount } = resolveItemPricing(item);
        const lineSubtotal = unitPrice * quantity;
        const lineSavings = hasDiscount ? (compareAtPrice - unitPrice) * quantity : 0;

        return {
          subtotal: acc.subtotal + lineSubtotal,
          savings: acc.savings + lineSavings,
          totalItems: acc.totalItems + quantity,
        };
      },
      { subtotal: 0, savings: 0, totalItems: 0 }
    );
  }, [items]);

  const shippingCost = selectedShipping.price;
  const couponDiscount = appliedCoupon ? subtotal * (appliedCoupon.discount ?? 0) : 0;
  const total = Math.max(subtotal - couponDiscount + shippingCost, 0);

  // logica de aplicacion de cupones
  const handleApplyCoupon = async (event) => {
    event.preventDefault();
    if (!couponCode.trim()) {
      setCouponError("Ingresá un código válido.");
      setAppliedCoupon(null);
      return;
    }

    setCouponError("");
    const trimmedCode = couponCode.trim().toUpperCase();

    try {
      const action = await dispatch(fetchCouponByCode(trimmedCode));

      if (!fetchCouponByCode.fulfilled.match(action)) {
        const rawMessage = action.error?.message || "";
        const normalizedMessage = rawMessage.toLowerCase();
        const isNotFound =
          normalizedMessage.includes("404") ||
          normalizedMessage.includes("not found") ||
          normalizedMessage.includes("no existe");

        setAppliedCoupon(null);
        setCouponError(
          isNotFound
            ? "Cupón no válido"
            : "Error al validar el cupón."
        );
        return;
      }

      const coupon = action.payload;
      const expiration = coupon?.expirationDate ?? coupon?.expirationdate;
      if (expiration) {
        const isExpired = new Date(expiration) < new Date();
        if (isExpired) {
          throw new Error("Cupón expirado.")
        }
      }
      setAppliedCoupon({
        ...coupon,
        code: coupon?.code?.toUpperCase?.() ?? coupon?.code,
      });
      setCouponError("");
    } catch (error) {
      setAppliedCoupon(null);

      const status = error?.response?.status;
      const rawMessage = error?.message || "";
      const normalizedMessage = rawMessage.toLowerCase();
      const isNotFound =
        status === 404 ||
        normalizedMessage.includes("404") ||
        normalizedMessage.includes("not found") ||
        normalizedMessage.includes("no existe");

      if (isNotFound) {
        setCouponError("Cupon no válido");
      } else {
        setCouponError(rawMessage || "No pudimos validar el cupón.");
      }
    }
  };

  // logica de eliminacion de cupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  // logica de confirmacion de compra
  const handleConfirmPurchase = async () => {
    if (items.length === 0) {
      setCheckoutError("Tu carrito está vacío. Volvé a la tienda para agregar productos.");
      return;
    }

    setProcessing(true);
    setCheckoutError("");
    const userId = currentUser?.id ?? location.state?.userId;
    if (!userId) {
      setCheckoutError("Necesitás iniciar sesión para finalizar la compra.");
      setProcessing(false);
      return;
    }

    const action = await dispatch(
      purchaseOrder({
        userId,
        items,
        couponCode: appliedCoupon?.code,
        paymentMethod: selectedPayment.id,
        shippingMethod: selectedShipping.id,
      })
    );

    if (purchaseOrder.fulfilled.match(action)) {
      const response = action.payload;
      setOrderResult(response);
      dispatch(clearCart())

      if (response?.orderId) {
        const detailsAction = dispatch(fetchOrderById(response.orderId));
        if (fetchOrderById.fulfilled.match(detailsAction)) {
          setOrderDetails(detailsAction.payload)
        }
      }
    } else {
      setCheckoutError(
        action.error?.message || "No pudimos completar tu compra."
      );
    }

    setProcessing(false);
  };

  const handleBackToCart = () => {
    navigate("/cart");
  };

  return (
    <main className="checkout-page">
      <header className="checkout-hero">
        <div className="container">
          <p>Checkout</p>
          <h1>Confirmá tu compra</h1>
          <p>
            {orderResult
              ? "¡Gracias por elegirnos!"
              : `${totalItems} ${totalItems === 1 ? "artículo" : "artículos"} listos para despachar`}
          </p>
        </div>
      </header>

      {orderResult ? (
        <section className="checkout-layout container">
          <div className="checkout-confirmation">
            {/* PANEL IZQUIERDO - ÉXITO */}
            <div className="checkout-panel checkout-panel--success">
              <div className="checkout-success-header">
                <div className="checkout-success-icon">
                  <span>✓</span>
                </div>
                <div>
                  <p className="checkout-success-kicker">Compra confirmada</p>
                  <h2 className="checkout-success-title">¡Gracias por tu compra!</h2>
                </div>
              </div>

              <div className="checkout-success-meta">
                <span className="checkout-success-pill">
                  Orden #{orderResult.orderId}
                </span>
                <span className="checkout-success-total">
                  Total pagado: {formatCurrency(orderResult.total ?? total)}
                </span>
              </div>

              <p className="checkout-confirmation__message">
                {orderResult.message || "La operación se realizó correctamente."}
              </p>

              <p className="checkout-confirmation__note">
                Enviamos un correo con los detalles de la compra y el seguimiento de tu pedido.
              </p>

              <div className="checkout-success-actions">
                <button
                  type="button"
                  className="checkout-primary"
                  onClick={() => navigate("/orders")}
                >
                  Ver detalle de la orden
                </button>
                <button
                  type="button"
                  className="checkout-secondary checkout-secondary--ghost"
                  onClick={() => navigate("/")}
                >
                  Seguir explorando
                </button>
              </div>
            </div>

            {/* PANEL DERECHO - RESUMEN DE ARTÍCULOS */}
            <div className="checkout-panel checkout-panel--summary">
              <h3>Resumen de artículos</h3>
              <ul className="checkout-items">
                {(orderDetails?.items ?? items).map((item) => (
                  <li key={item.id ?? item.productId} className="checkout-item">
                    <div>
                      <p className="checkout-item__title">
                        {item.name ?? item.productName}
                      </p>
                      <span className="checkout-item__meta">
                        Cantidad: {item.quantity ?? item.qty}
                      </span>
                    </div>
                    <span className="checkout-item__price">
                      {formatCurrency(
                        item.subtotal ??
                        item.price * (item.quantity ?? item.qty ?? 1)
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : items.length === 0 ? (
        <section className="checkout-layout container">
          <div className="checkout-panel">
            <h2>No hay artículos en el checkout</h2>
            <p>
              Volvé al carrito para seleccionar productos y luego elegí el método de envío y pago.
            </p>
            <button type="button" className="checkout-secondary" onClick={handleBackToCart}>
              Ir al carrito
            </button>
          </div>
        </section>
      ) : (
        <section className="checkout-layout container">
          <div className="checkout-flow">
            <div className="checkout-panel">
              <h2>Envío</h2>
              <div className="shipping-options">
                {shippingOptions.map((option) => {
                  const isActive = option.id === selectedShipping.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`shipping-option ${isActive ? "active" : ""}`}
                      onClick={() => setSelectedShipping(option)}
                    >
                      <div className="shipping-option__info">
                        <span className="shipping-option__title">{option.title}</span>
                        <span className="shipping-option__meta">
                          {option.description} · {option.eta}
                        </span>
                      </div>
                      <span>
                        {option.price === 0
                          ? "Gratis"
                          : formatCurrency(option.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="checkout-panel">
              <h2>Pago</h2>
              <div className="payment-options">
                {paymentMethods.map((method) => {
                  const isActive = method.id === selectedPayment.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      className={`payment-option ${isActive ? "active" : ""}`}
                      onClick={() => setSelectedPayment(method)}
                    >
                      <div>
                        <span className="payment-option__title">{method.title}</span>
                      </div>
                      <div>
                        <span className="payment-option__meta">{method.description}</span>
                      </div>
                      <span className="payment-option__radio" aria-hidden>
                        {isActive ? "●" : "○"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="checkout-panel">
              <h2>Cupón</h2>
              <form className="coupon-form" onSubmit={handleApplyCoupon}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="Código promocional"
                  className="coupon-input"
                />
                <button type="submit" className="checkout-secondary" disabled={couponLoading}>
                  {couponLoading ? "Validando..." : "Aplicar"}
                </button>
                {appliedCoupon && (
                  <button
                    type="button"
                    className="coupon-remove"
                    onClick={handleRemoveCoupon}
                  >
                    Quitar
                  </button>
                )}
              </form>
              {couponError && (
                <p className="coupon-error" role="alert">
                  {couponError}
                </p>
              )}
              {appliedCoupon && (
                <p className="coupon-success">
                  Cupón {appliedCoupon.code} aplicado. Descuento de {(appliedCoupon.discount * 100).toFixed(0)}%.
                </p>
              )}
            </div>
          </div>

          <aside className="checkout-summary">
            <h2>Resumen</h2>
            <ul className="checkout-items">
              {items.map((item) => {
                const quantity = Number(item.quantity ?? 1) || 1;
                const { unitPrice, compareAtPrice, hasDiscount, discountRate } =
                  resolveItemPricing(item);
                const previewImage = normalizeBase64Image(
                  item.base64img ?? item.base64Img
                );

                return (
                  <li key={item.id} className="checkout-item">
                    <div className="checkout-item__info">
                      <p className="checkout-item__title">{item.name}</p>
                      <span className="checkout-item__meta">Cantidad: {quantity}</span>
                    </div>
                    <div className="checkout-item__pricing">
                      {hasDiscount && (
                        <span className="checkout-item__price-original">
                          {formatCurrency(compareAtPrice * quantity)}
                        </span>
                      )}
                      <span className="checkout-item__price-final">
                        {formatCurrency(unitPrice * quantity)}
                      </span>
                      {hasDiscount && (
                        <span className="checkout-item__discount-tag">
                          Ahorro {Math.round(discountRate * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="vf-mini">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt={`Vista previa de ${item.name}`}
                        />
                      ) : (
                        <div className="vf-mini-empty">Sin imagen</div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="checkout-selection">
              <span>Envío: {selectedShipping.title}</span>
              <span>Pago: {selectedPayment.title}</span>
            </div>

            {savings > 0 && (
              <div className="summary-row savings">
                <span>Ahorros</span>
                <span className="savings-tag">- {formatCurrency(savings)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Envío ({selectedShipping.title})</span>
              <span>
                {shippingCost === 0 ? "Sin cargo" : formatCurrency(shippingCost)}
              </span>
            </div>
            {couponDiscount > 0 && (
              <div className="summary-row savings">
                <span>Cupón</span>
                <span className="savings-tag">- {formatCurrency(couponDiscount)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            {checkoutError && (
              <p className="checkout-error">{checkoutError}</p>
            )}

            <button
              type="button"
              className="cart-checkout"
              onClick={handleConfirmPurchase}
              disabled={processing}
            >
              {processing ? "Procesando..." : "Confirmar compra"}
            </button>
            <p className="checkout-note">
              Vas a poder revisar los datos de pago antes de confirmar la operación.
            </p>
          </aside>
        </section>
      )}
    </main>
  );
};

export default CheckoutView;

/* CHECKOUT
- Tiene resumen con forma de envio, etc
- Permite seleccionar metodo de pago
- Aplicar cupon de descuento
- Finalizar compra
 
--> Una vez finalizada, muestra id de orden y resumen
--> Tambien mensaje de "hemos enviado un email con los detalles"
*/