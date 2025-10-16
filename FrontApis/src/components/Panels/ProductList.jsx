import { toDisplayValue, toNumberOrEmpty } from "../../helpers/valueConverter";

const resolveCategoryLabel = (product, categories) => {
  const categoryIdValue =
    product.category_id ?? product.categoryId ?? product.category?.id ?? null;

  if (categoryIdValue === null || categoryIdValue === undefined) {
    return (
      product.category?.description ||
      product.category_description ||
      categoryIdValue ||
      ""
    );
  }

  const match = categories.find(
    (category) => String(category.id) === String(categoryIdValue)
  );

  return (
    match?.description ||
    product.category?.description ||
    product.category_description ||
    `ID ${categoryIdValue}`
  );
};

const getDiscountLabel = (product) => {
  const discountValue = Number(product.discount ?? 0);
  const hasDiscount = Number.isFinite(discountValue) && discountValue > 0;
  return hasDiscount ? `${(discountValue * 100).toFixed(0)}%` : "Sin descuento";
};

const mapProductToForm = (product) => ({
  name: toDisplayValue(product?.name),
  description: toDisplayValue(product?.description),
  price: toNumberOrEmpty(product?.price),
  discount: toNumberOrEmpty(product?.discount),
  size: (toDisplayValue(product?.size) || "").toUpperCase(),
  stock: toNumberOrEmpty(product?.stock),
  category_id: toNumberOrEmpty(product?.category_id),
  image_url: toDisplayValue(product?.base64img),
  creator_id: toNumberOrEmpty(product?.creator_id),
});

function ProductList({ products, categories, onEdit, onDelete }) {
  return (
    <div className="admin-list">
      {products.map((product) => {
        const categoryLabel = resolveCategoryLabel(product, categories);
        return (
          <article
            key={product.id || product.name || product.title}
            className="admin-item"
          >
            <div className="admin-item-main">
              <h3>{product.name || product.title || `Producto #${product.id}`}</h3>
              <p className="admin-item-meta">
                ID: {product.id ?? "-"} · Precio: ${product.price ?? "-"} · Stock: {" "}
                {product.stock ?? "-"}
              </p>
              <p className="admin-item-meta">
                Descuento: {getDiscountLabel(product)}
              </p>
              {product.size && (
                <p className="admin-item-meta">Talle: {product.size}</p>
              )}
              {categoryLabel && (
                <p className="admin-item-meta">Categoría: {categoryLabel}</p>
              )}
            </div>
            <div className="admin-item-actions">
              <button
                type="button"
                className="admin-button"
                onClick={() => onEdit(mapProductToForm(product), product.id)}
              >
                Editar
              </button>
              <button
                type="button"
                className="admin-button danger"
                onClick={() => onDelete(product.id)}
              >
                Eliminar
              </button>
            </div>
          </article>
        );
      })}
      {products.length === 0 && (
        <p className="admin-empty">No hay productos cargados.</p>
      )}
    </div>
  );
}

export { mapProductToForm };
export default ProductList;