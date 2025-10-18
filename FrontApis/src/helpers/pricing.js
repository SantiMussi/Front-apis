/* Funcion para formatear numero como cadena monetaria */

export const formatCurrency = (
  value,
  {
    currency = "$",
    locale = undefined,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = {}
) =>
  `${currency}${Number(value ?? 0).toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;


// Calcula el precio unitario real, el precio de comparacion, si existe descuento y la tasa de descuento de un item dado
// Usado en componentes que tienen productos y necesitan mostrar evolucion de precios

export const resolveItemPricing = (item) => {
  const priceValue = Number(item?.price ?? 0);
  const originalPriceValue = Number(item?.originalPrice ?? priceValue);
  const discountValue = Number(item?.discount ?? 0);
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
  const discountRate =
    hasDiscount && compareAtPrice !== 0 ? 1 - unitPrice / compareAtPrice : 0;

  return {
    unitPrice,
    compareAtPrice: hasDiscount ? compareAtPrice : unitPrice,
    hasDiscount,
    discountRate,
  };
};