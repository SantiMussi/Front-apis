import { toDisplayValue, toNumberOrEmpty } from "../../helpers/valueConverter";

/* Resuelve la etiqueta de categoría para mostrar en la lista. Prioriza categoryId, busca en categories y cae en campos alternativos. */
const resolveCategoryLabel = (product, categories) => {
  const categoryIdValue =
    product.categoryId ?? null;

  if (categoryIdValue === null || categoryIdValue === undefined) {
    return (
      product.category?.description ||
      categoryIdValue ||
      ""
    );
  }

  const match = categories.find(
    (category) => String(category.id) === String(categoryIdValue)
  );

  return (
    match?.description ||
    `ID ${categoryIdValue}`
  );
};

/* Devuelve una etiqueta legible para el descuento (p.ej. "15%" o "Sin descuento") */
const getDiscountLabel = (product) => {
  const discountValue = Number(product.discount ?? 0);
  const hasDiscount = Number.isFinite(discountValue) && discountValue > 0;
  return hasDiscount ? `${(discountValue * 100).toFixed(0)}%` : "Sin descuento";
};

/* Mapea un producto recibido desde la API a la forma esperada por el formulario */
const mapProductToForm = (product) => ({
  name: toDisplayValue(product?.name),
  description: toDisplayValue(product?.description),
  price: toNumberOrEmpty(product?.price),
  discount: toNumberOrEmpty(product?.discount),
  size: (toDisplayValue(product?.size) || "").toUpperCase(),
  stock: toNumberOrEmpty(product?.stock),
  categoryId: toNumberOrEmpty(product?.categoryId),
  image_url: toDisplayValue(product?.base64img),
  creator_id: toNumberOrEmpty(product?.creatorId),
  base64img: toDisplayValue(product?.base64img),
  image_preview_url: toDisplayValue(
    product?.image_preview_url || product?.base64img || product?.imageUrl
  ),
});

const ProductList = ({ products, categories, onEdit, onDelete }) => {
  const canEdit = typeof onEdit === "function";
  const canDelete = typeof onDelete === "function";
  const hasActions = canEdit || canDelete;

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
            {hasActions && (
              <div className="admin-item-actions">
                {canEdit && (
                  <button
                    type="button"
                    className="admin-button"
                    onClick={() => onEdit(mapProductToForm(product), product.id)}
                  >
                    Editar
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    className="admin-button danger"
                    onClick={() => onDelete(product.id)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
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