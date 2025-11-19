import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProductById } from "../services/checkoutService";
import CartItem from "../components/Cart/CartItem";
import "../components/Cart/cart.css";
import { formatCurrency, resolveItemPricing } from "../helpers/pricing";
import { isLoggedIn } from "../services/authService";
import {useSelector} from "react-redux";

const CartView = () => {
  const [items, setItems] = useState([]);
  const selector = useSelector();
  useEffect((selector) => {
    let mounted = true;
    const loadDemoProducts = async () => {
      if (!isLoggedIn(selector)) return;
      try {
        const demoProduct1 = await getProductById(1);
        const demoProduct2 = await getProductById(3);
        // assign example quantities
        if (demoProduct1 && mounted) demoProduct1.quantity = 2;
        if (demoProduct2 && mounted) demoProduct2.quantity = 1;
        if (mounted) setItems([demoProduct1, demoProduct2]);
      } catch {
        // fail silently for demo load
      } finally {
        if (mounted) {
          // no-op
        }
      }
    };

    loadDemoProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const navigate = useNavigate();

  /* maneja el cambio de cantidad de un artículo en el carrito. Se lo pasa como prop al cartItem */
  const handleQuantityChange = (id, nextQuantity) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, nextQuantity) } : item
      )
    );
  };

  /* maneja eliminación de un artículo del carrito */
  const handleRemove = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  /* calcula subtotal, ahorros y total de artículos en el carrito */
  const { subtotal, originalSubtotal, savings, totalItems } = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          const quantity = Number(item.quantity ?? 1) || 1;
          const { unitPrice, compareAtPrice, hasDiscount } = resolveItemPricing(item);
          const lineSubtotal = unitPrice * quantity;
          const lineOriginalSubtotal = compareAtPrice * quantity;
          const lineSavings = hasDiscount
            ? (compareAtPrice - unitPrice) * quantity
            : 0;

          return {
            subtotal: acc.subtotal + lineSubtotal,
            originalSubtotal: acc.originalSubtotal + lineOriginalSubtotal,
            savings: acc.savings + lineSavings,
            totalItems: acc.totalItems + item.quantity,
          };
        },
        { subtotal: 0, originalSubtotal: 0, savings: 0, totalItems: 0 }
      ),
    [items]
  );

  const estimatedTotal = subtotal;
  const savingsRate = originalSubtotal > 0 && savings > 0 ? Math.round((savings / originalSubtotal) * 100) : 0;

  const handleProceedToCheckout = () => {
    navigate("/checkout", {
      state: {
        items,
      },
    });
  };

  return (
    <main className="cart-page">
      <header className="cart-hero">
        <div className="container">
          <p>Resumen del pedido</p>
          <h1>Tu carrito</h1>
          <p>{totalItems} {totalItems === 1 ? "artículo" : "artículos"} listos para finalizar</p>
        </div>
      </header>

      <section className="cart-layout container">
        <div className="cart-content">
          <div className="cart-card">
            <div className="cart-items__header">
              <h2>Productos</h2>
              <span>{totalItems} {totalItems === 1 ? "unidad" : "unidades"}</span>
            </div>
            {items.length === 0 ? (
              <div className="cart-empty">Tu carrito está vacío. Explora las colecciones para continuar.</div>
            ) : (
              items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                    quantity={Number(item.quantity ?? 1)}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))
            )}
          </div>
          <div className="cart-actions">
            <div className="cart-actions__info">
              <h2 className="cart-actions__title">¿Listo para finalizar?</h2>
              <p className="cart-actions__description">
                Revisá los detalles de tus productos antes de pasar al checkout. Allí vas a poder elegir el método de envío y pago.
              </p>
              <p className="cart-actions__summary">
                Tenés {totalItems} {totalItems === 1 ? "artículo" : "artículos"} con un subtotal estimado de {formatCurrency(estimatedTotal)}
              </p>
              {savings > 0 && (
                <p className="cart-actions__savings">Ahorrás {formatCurrency(savings)} ({savingsRate}%)</p>
              )}
            </div>
            <button
              className="cart-checkout cart-actions__button"
              type="button"
              onClick={handleProceedToCheckout}
              disabled={items.length === 0}
            >
              Ir al checkout
            </button>
            <p className="cart-note">Los productos se guardan durante 60 minutos.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CartView;

/*Mostrar productos en el carrito


Por cada producto queremos mostrar:
--> Precio Unitario (descontado si aplica) 
--> Cantidad 
--> Precio Total 
--> Boton para eliminar el producto del carrito
*/