import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProductById } from "../services/checkoutService";
import CartItem from "../components/Cart/CartItem";
import "../components/Cart/cart.css";

const demoProduct = await getProductById(1); // Producto de ejemplo
demoProduct.quantity = 2; // Cantidad de ejemplo

const CartView = () => {
  const [items, setItems] = useState([demoProduct]);
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
  const { subtotal, savings, totalItems } = useMemo(() => { /* usamos memo para optimizar el cálculo de totales */
    return items.reduce(
      (acc, item) => {
        const lineSubtotal = item.price * item.quantity;
        const lineSavings = Math.max(0, (item.originalPrice ?? item.price) - item.price) * item.quantity;

        return {
          subtotal: acc.subtotal + lineSubtotal,
          savings: acc.savings + lineSavings,
          totalItems: acc.totalItems + item.quantity,
        };
      },
      { subtotal: 0, savings: 0, totalItems: 0 }
    );
  }, [items]);

  const estimatedTotal = subtotal;

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
                  quantity={1}
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
                Tenés {totalItems} {totalItems === 1 ? "artículo" : "artículos"} con un subtotal estimado de ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
              </p>  
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