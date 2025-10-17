const CartItem = ({item, onQuantityChange, onRemove}) => {

  const { id, name, size, price, originalPrice, quantity, image } = item;
  const hasDiscount = originalPrice && originalPrice > price;
  const subtotal = price * quantity;
  const discountRate = hasDiscount ? 1 - price / originalPrice : 0;

  return (
    <article className="cart-item">
      <div className="cart-item__media">
        <img src={image} alt={name} /> {/* mostrar imagen del producto */}
      </div>
      <div className="cart-item__content">
        <div className="cart-item__header">
          <div>
            <h3 className="cart-item__title">{name}</h3> {/* mostrar nombre del producto */}
          </div>
          <button 
            className="cart-item__remove"
            type="button"
            onClick={() => onRemove(id)} 
          >
            Quitar {/* eliminar producto del carrito */}
          </button>
        </div>
        <p className="cart-item__meta">
          <span>Talle {size}</span> {/* mostrar talle del producto */}
        </p>
        <div className="cart-item__footer">
          <div className="cart-item__price price-block">
            <span className="cart-item__price-current price-current">
              ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {/* mostrar precio total */}
            {hasDiscount && (
              <span className="cart-item__price-original price-original">
                ${(originalPrice * quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {/* mostrar precio unitario original si hay descuento */}
              </span>
            )}
            {hasDiscount && (
              <span className="cart-item__price-tag price-tag">
                -{Math.round(discountRate * 100)}% {/* mostrar etiqueta de descuento */}
              </span>
            )}
          </div>
          <div className="cart-item__quantity">
            <button
              type="button"
              onClick={() => onQuantityChange(id, Math.max(1, quantity - 1))}
              aria-label="Disminuir cantidad"
            >
              − {/* disminuir cantidad del producto */}
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(id, quantity + 1)}
              aria-label="Aumentar cantidad"
            >
              + {/* aumentar cantidad del producto */}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CartItem;