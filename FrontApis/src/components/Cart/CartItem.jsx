const normalizeBase64Image = (value) => {
  if (!value) return null;
  return value.startsWith("data:") ? value : `data:image/png;base64,${value}`;
};

const formatCurrency = (value) =>
  `$${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const {
    id,
    name,
    size,
    price,
    originalPrice,
    quantity,
    image,
    base64img,
    base64Img,
    description,
    categoryName,
    brand,
    color,
    discount,
  } = item;

  const priceValue = Number(price ?? 0);
  const discountValue = Number(discount ?? 0);
  const originalPriceValue = Number(originalPrice ?? priceValue);

  const hasDiscountFromDiscount = Number.isFinite(discountValue) && discountValue > 0;

  let unitPrice = priceValue;
  let compareAtPrice = originalPriceValue;

  if (hasDiscountFromDiscount) {
    compareAtPrice = priceValue;
    unitPrice = priceValue * (1 - discountValue);
  } else if (originalPriceValue > priceValue) {
    unitPrice = priceValue;
    compareAtPrice = originalPriceValue;
  }

  const hasDiscount = compareAtPrice > unitPrice && compareAtPrice > 0;
  const subtotal = unitPrice * quantity;
  const discountRate = hasDiscount && compareAtPrice !== 0 ? 1 - unitPrice / compareAtPrice : 0;

  const resolvedImage =
    normalizeBase64Image(base64img ?? base64Img) ?? image ?? "https://via.placeholder.com/120x140?text=Producto";

  const detailChips = [
    size ? `Talle ${size}` : null,
    color ?? null,
  ].filter(Boolean);

  const leadingLabel = categoryName ?? brand ?? null;

  return (
    <article className="cart-item">
      <div className="cart-item__media">
        <img src={resolvedImage} alt={name} />
      </div>
      <div className="cart-item__content">
        <div className="cart-item__header">
          <div>
            {leadingLabel && <p className="cart-item__brand">{leadingLabel}</p>}
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
        {description && <p className="cart-item__description">{description}</p>}
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
              onClick={() => onQuantityChange(id, Math.max(1, quantity - 1))}
              aria-label="Disminuir cantidad"
            >
              − 
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(id, quantity + 1)}
              aria-label="Aumentar cantidad"
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