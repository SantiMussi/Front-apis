import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import CartItem from "../components/Cart/CartItem";
import "../components/Cart/cart.css";
import { formatCurrency, resolveItemPricing } from "../helpers/pricing";
import { IsLoggedIn } from "../services/authService";
import {useDispatch, useSelector} from "react-redux";

const CartView = () => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);

  const navigate = useNavigate();

  // Cambia la cantidad de un artículo en el carrito, respetando stock
  const handleQuantityChange = (id, nextQuantity, size, stock) => {
    const numericNext = Number(nextQuantity) || 0;

    let safeQuantity;
    if (typeof stock === "number") {
      if (numericNext < 1) safeQuantity = 1;
      else if (numericNext > stock) safeQuantity = stock;
      else safeQuantity = numericNext;
    } else {
      safeQuantity = numericNext < 1 ? 1 : numericNext;
    }

    dispatch({
      type: "cart/updateQuantity",
      payload: { id, size, quantity: safeQuantity },
    });
  };

  // Elimina un artículo del carrito
  const handleRemove = (id, size) => {
    dispatch({ type: "cart/removeFromCart", payload: { id, size } });
  };

  // calcula subtotal, ahorros y total de artículos en el carrito
  const { subtotal, originalSubtotal, savings, totalItems } = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          const quantity = Number(item.quantity ?? 1) || 1;
          const { unitPrice, compareAtPrice, hasDiscount } =
            resolveItemPricing(item);
          const lineSubtotal = unitPrice * quantity;
          const lineOriginalSubtotal = compareAtPrice * quantity;
          const lineSavings = hasDiscount
            ? (compareAtPrice - unitPrice) * quantity
            : 0;

          return {
            subtotal: acc.subtotal + lineSubtotal,
            originalSubtotal: acc.originalSubtotal + lineOriginalSubtotal,
            savings: acc.savings + lineSavings,
            totalItems: acc.totalItems + quantity,
          };
        },
        { subtotal: 0, originalSubtotal: 0, savings: 0, totalItems: 0 }
      ),
    [items]
  );

  const estimatedTotal = subtotal;
  const savingsRate =
    originalSubtotal > 0 && savings > 0
      ? Math.round((savings / originalSubtotal) * 100)
      : 0;

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
          <p>
            {totalItems} {totalItems === 1 ? "artículo" : "artículos"} listos
            para finalizar
          </p>
        </div>
      </header>

      <section className="cart-layout container">
        <div className="cart-content">
          <div className="cart-card">
            <div className="cart-items__header">
              <h2>Productos</h2>
              <span>
                {totalItems} {totalItems === 1 ? "unidad" : "unidades"}
              </span>
            </div>
            {items.length === 0 ? (
              <div className="cart-empty">
                Tu carrito está vacío. Explora las colecciones para continuar.
              </div>
            ) : (
              items.map((item) => (
                <CartItem
                  key={item.id + (item.size || "")}
                  item={item}
                  onQuantityChange={(id, nextQuantity) =>
                    handleQuantityChange(
                      id,
                      nextQuantity,
                      item.size,
                      item.stock
                    )
                  }
                  onRemove={(id) => handleRemove(id, item.size)}
                />
              ))
            )}
          </div>

          <div className="cart-actions">
            <div className="cart-actions__info">
              <h2 className="cart-actions__title">¿Listo para finalizar?</h2>
              <p className="cart-actions__description">
                Revisá los detalles de tus productos antes de pasar al checkout.
                Allí vas a poder elegir el método de envío y pago.
              </p>
              <p className="cart-actions__summary">
                Tenés {totalItems}{" "}
                {totalItems === 1 ? "artículo" : "artículos"} con un subtotal
                estimado de {formatCurrency(estimatedTotal)}
              </p>
              {savings > 0 && (
                <p className="cart-actions__savings">
                  Ahorrás {formatCurrency(savings)} ({savingsRate}%)
                </p>
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
            <p className="cart-note">
              Los productos se guardan durante 60 minutos.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CartView;
