import { SIZE_OPTIONS } from "../../constants/product";

function ProductForm({
  title,
  product,
  categories,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
  isSubmitDisabled = false,
  cancelLabel = "Cancelar edición",
  sizeOptions = SIZE_OPTIONS,
}) {
  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {title && <h3>{title}</h3>}
      <div className="admin-form-grid">
        <label>
          Nombre
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Precio
          <input
            type="number"
            step="0.01"
            name="price"
            value={product.price}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Stock
          <input
            type="number"
            min="0"
            name="stock"
            value={product.stock}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Descuento
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            name="discount"
            value={product.discount}
            onChange={onChange}
          />
        </label>
        <label>
          Imagen (URL)
          <input
            type="url"
            name="image_url"
            value={product.image_url}
            onChange={onChange}
          />
        </label>
        <label className="full-width">
          Descripción
          <textarea
            name="description"
            value={product.description}
            onChange={onChange}
            rows={3}
          />
        </label>
        <label>
          Talle
          <select
            className="admin-select"
            name="size"
            value={product.size}
            onChange={onChange}
            required
          >
            <option value="">Seleccionar talle</option>
            {sizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <label>
          Categoría
          <select
            className="admin-select"
            name="category_id"
            value={product.category_id}
            onChange={onChange}
            required
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.description ?? `ID ${category.id}`}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="admin-form-actions">
        {onCancel && (
          <button
            type="button"
            className="admin-button ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          className="admin-button primary"
          disabled={isSubmitting || isSubmitDisabled}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;