import { formatCurrency, resolveItemPricing } from "../../helpers/pricing";
import { normalizeBase64Image } from "../../helpers/image";

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const {
    id,
    name,
    size,
    price,
    originalPrice,
    quantity,
    base64img,
    description,
    categoryName,
    discount,
    stock,
  } = item;

  const { unitPrice, compareAtPrice, hasDiscount, discountRate } =
    resolveItemPricing({
      price,
      originalPrice,
      discount,
    });

  const subtotal = unitPrice * quantity;

  const resolvedImage = normalizeBase64Image(base64img);

  const detailChips = [size ? `Talle ${size}` : null].filter(Boolean);
  const leadingLabel = categoryName ?? null;

  const maxQty = typeof stock === "number" ? stock : Infinity;
  const minQty = 1;

  const canIncrease = quantity < maxQty;
  const canDecrease = quantity > minQty;

  return (
    <article className="cart-item">
      <div className="cart-item__media">
        <img src={resolvedImage} alt={name} />
      </div>
      <div className="cart-item__content">
        <div className="cart-item__header">
          <div>
            {leadingLabel && (
              <p className="cart-item__brand">{leadingLabel}</p>
            )}
            <h3 className="cart-item__title">{name}</h3>
          </div>
          <button
            className="cart-item__remove"
            type="button"
            onClick={() => onRemove(id)}
          >
            Quitar
          </button>
        </div>

        {(detailChips.length > 0 || description) && (
          <div className="cart-item__meta">
            {detailChips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
        )}

        {description && (
          <p className="cart-item__description">{description}</p>
        )}

        <div className="cart-item__footer">
          <div className="cart-item__price price-block">
            <span className="cart-item__price-current price-current">
              {formatCurrency(subtotal)}
            </span>
            {hasDiscount && (
              <span className="cart-item__price-original price-original">
                {formatCurrency(compareAtPrice * quantity)}
              </span>
            )}
            {hasDiscount && (
              <span className="cart-item__price-tag price-tag">
                -{Math.round(discountRate * 100)}%
              </span>
            )}
          </div>

          <div className="cart-item__quantity">
            <button
              type="button"
              onClick={() =>
                onQuantityChange(id, Math.max(minQty, quantity - 1))
              }
              aria-label="Disminuir cantidad"
              disabled={!canDecrease}
            >
              −
            </button>

            <span>{quantity}</span>

            <button
              type="button"
              onClick={() => onQuantityChange(id, quantity + 1)}
              aria-label="Aumentar cantidad"
              disabled={!canIncrease}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CartItem;
