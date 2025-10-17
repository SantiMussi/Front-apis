import { useMemo, useState } from "react";
import CartItem from "../components/Cart/CartItem";
import "../components/Cart/cart.css";

const demoProducts = [
  {
    id: 1,
    name: "Chaqueta Urban Tech",
    brand: "Nightfall",
    color: "Negro carbón",
    size: "M",
    price: 189.99,
    originalPrice: 229.99,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1542293787938-4d2226c10e9a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Zapatilla Prism Runner",
    brand: "Axis",
    color: "Blanco ártico",
    size: "42",
    price: 129.5,
    originalPrice: 149.5,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Jogger Gravity Fit",
    brand: "Pulse",
    color: "Gris titanio",
    size: "L",
    price: 89.0,
    originalPrice: 89.0,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1575468717532-77cd571a17ce?auto=format&fit=crop&w=800&q=80",
  },
];

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

const CartView = () => {
  const [items, setItems] = useState(demoProducts);
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);

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

  const shippingCost = selectedShipping.price;
  const total = subtotal + shippingCost;

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
        <div>
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
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))
            )}
          </div>
        </div>

        <aside className="cart-summary">
          <h2>Resumen</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          {savings > 0 && (
            <div className="summary-row savings">
              <span>Ahorros</span>
              <span className="savings-tag">- ${savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

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
                    <span className="shipping-option__meta">{option.description} · {option.eta}</span>
                  </div>
                  <span>{option.price === 0 ? "Gratis" : `$${option.price.toFixed(2)}`}</span>
                </button>
              );
            })}
          </div>

          <div className="summary-row">
            <span>Envío</span>
            <span>{shippingCost === 0 ? "Sin cargo" : `$${shippingCost.toFixed(2)}`}</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <button className="cart-checkout" type="button">Finalizar compra</button>

          <p className="cart-note">Los productos se guardan durante 60 minutos. Podrás seleccionar el método de pago en el siguiente paso.</p>
        </aside>
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