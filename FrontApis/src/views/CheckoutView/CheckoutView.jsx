import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCouponByCode, getOrderById, purchaseOrder } from "../../services/checkoutService";
import { getCurrentUser } from "../../services/authService";
import "./checkout.css";
import { formatCurrency, resolveItemPricing } from "../../helpers/pricing";
import { normalizeBase64Image } from "../../helpers/image";

const shippingOptions = [
  {
    id: "express",
    title: "Envío Express",
    eta: "24-48 hs",
    description: "Entrega prioritaria en centros urbanos",
    price: 14.99,
  },
  {
    id: "standard",
    title: "Envío Standard",
    eta: "3-5 días",
    description: "Envío regular con seguimiento",
    price: 6.5,
  },
  {
    id: "pickup",
    title: "Retiro en tienda",
    eta: "Disponible en 2 hs",
    description: "Retirá gratis por nuestra tienda",
    price: 0,
  },
];

const paymentMethods = [
  {
    id: "card",
    title: "Tarjeta de crédito",
    description: "Visa, Mastercard, AMEX en hasta 12 cuotas",
  },
  {
    id: "debit",
    title: "Tarjeta de débito",
    description: "Acreditación inmediata",
  },
  {
    id: "cash",
    title: "Transferencia o depósito",
    description: "Mostraremos los datos bancarios una vez confirmes la compra",
  },
];

const CheckoutView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [items] = useState(() => location.state?.items ?? []);
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

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

  const handleApplyCoupon = async (event) => {
    event.preventDefault();
    if (!couponCode.trim()) {
      setCouponError("Ingresá un código válido.");
      setAppliedCoupon(null);
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      const coupon = await getCouponByCode(couponCode.trim());
      const expiration = coupon.expirationDate ?? coupon.expirationdate;
      if (expiration) {
        const isExpired = new Date(expiration) < new Date();
        if (isExpired) {
          throw new Error("El cupón se encuentra vencido.");
        }
      }
      setAppliedCoupon({
        ...coupon,
        code: coupon.code?.toUpperCase?.() ?? coupon.code,
      });
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(error.message || "No pudimos validar el cupón.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleConfirmPurchase = async () => {
    if (items.length === 0) {
      setCheckoutError("Tu carrito está vacío. Volvé a la tienda para agregar productos.");
      return;
    }

    setProcessing(true);
    setCheckoutError("");


    try {
        const userId = user?.id ?? location.state?.userId;
        if (!userId) {
          throw new Error("Necesitás iniciar sesión para finalizar la compra.");
        }
        
        const response = await purchaseOrder({
          userId,
          items,
          couponCode: appliedCoupon?.code,
      });

      setOrderResult(response);

      if (response?.orderId) {
        try {
          const details = await getOrderById(response.orderId);
          setOrderDetails(details);
        } catch (error) {
          console.warn("No se pudo obtener el detalle de la orden", error);
        }
      }
    } catch (error) {
      setCheckoutError(error.message || "No pudimos completar tu compra.");
    } finally {
      setProcessing(false);
    }
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
            <div className="checkout-panel">
              <h2>Compra confirmada</h2>
              <p className="checkout-confirmation__message">
                {orderResult.message || "La operación se realizó correctamente."}
              </p>
              <div className="checkout-confirmation__meta">
                <span>Orden #{orderResult.orderId}</span>
                <span>Total pagado: {formatCurrency(orderResult.total ?? total)}</span>
              </div>
              <p className="checkout-confirmation__note">
                Enviamos un correo con los detalles de la compra y el seguimiento de tu pedido.
              </p>
            </div>

            <div className="checkout-panel">
              <h3>Resumen de artículos</h3>
              <ul className="checkout-items">
                {(orderDetails?.items ?? items).map((item) => (
                  <li key={item.id ?? item.productId} className="checkout-item">
                    <div>
                      <p className="checkout-item__title">{item.name ?? item.productName}</p>
                      <span className="checkout-item__meta">
                        Cantidad: {item.quantity ?? item.qty}
                      </span>
                    </div>
                    <span className="checkout-item__price">
                      {formatCurrency(
                        (item.subtotal ?? item.price * (item.quantity ?? item.qty ?? 1))
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="checkout-secondary"
                onClick={() => navigate("/")}
              >
                Seguir explorando
              </button>
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
              {couponError && <p className="coupon-error">{couponError}</p>}
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