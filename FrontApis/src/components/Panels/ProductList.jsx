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

const resolveProductImage = (product) => {
  const base64Candidate =
    product.base64img ??
    product.imgBase64 ??
    product.image_url ??
    product.imageUrlBase64 ??
    product.imageBase64 ??
    null;

  if (typeof base64Candidate === "string" && base64Candidate.length > 0) {
    if (/^(data:|https?:)/i.test(base64Candidate)) {
      return base64Candidate;
    }

    const sanitized = base64Candidate.replace(/\s+/g, "");
    const isLikelyBase64 =
      sanitized.length > 40 && /^[A-Za-z0-9+/=]+$/.test(sanitized);
    if (isLikelyBase64) {
      return `data:image/png;base64,${sanitized}`;
    }
    return base64Candidate;
  }

  return (
    product.image_preview_url ??
    product.previewImage ??
    product.imagePreview ??
    product.image ??
    product.imageUrl ??
    product.thumbnail ??
    null
  );
};

const ProductList = ({ products, categories, onEdit, onDelete }) => {
  const canEdit = typeof onEdit === "function";
  const canDelete = typeof onDelete === "function";
  const hasActions = canEdit || canDelete;

  return (
    <div className="admin-list">
      {products.map((product) => {
        const categoryLabel = resolveCategoryLabel(product, categories);
        const imageSource = resolveProductImage(product);
        const productLabel = product.name || product.title || `Producto #${product.id}`;

        return (
          <article
            key={product.id || product.name || product.title}
            className="admin-item with-preview"
          >
            <div className="admin-item-visual" aria-hidden={!imageSource}>
              <div className="vf-mini">
                {imageSource ? (
                  <img src={imageSource} alt={`Vista previa de ${productLabel}`} />
                ) : (
                  <div className="vf-mini-empty">Sin imagen</div>
                )}
              </div>
            </div>
            <div className="admin-item-main">
              <h3>{productLabel}</h3>
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
              {product.creatorId && (
                <p className="admin-item-meta">Publicado por usuario con ID: {product.creatorId}</p>
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