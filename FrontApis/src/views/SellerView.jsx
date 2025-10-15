import { useEffect, useMemo, useState } from "react";
import { createProduct, getCategories } from "../services/adminService";

const EMPTY_PRODUCT = {
  name: "",
  description: "",
  price: "",
  discount: "",
  size: "",
  stock: "",
  category_id: "",
  image_url: "",
};

const SIZE_OPTIONS = ["S", "M", "L", "XL"];

function SellerView() {
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notify = (type, message) => {
    setStatus({ type, message });
    window.clearTimeout(notify.timeoutId);
    notify.timeoutId = window.setTimeout(() => setStatus(null), 5000);
  };

  const resetProductForm = () => {
    setProductForm(EMPTY_PRODUCT);
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const data = await getCategories();
      const parsedCategories = Array.isArray(data) ? data : data?.content || [];
      setCategories(parsedCategories);
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudieron cargar las categorías");
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    return () => {
      if (notify.timeoutId) {
        window.clearTimeout(notify.timeoutId);
      }
    };
  }, []);

  const handleProductChange = (event) => {
    const { name, value } = event.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const trimmedName = productForm.name.trim();
      if (!trimmedName) {
        notify("error", "El nombre del producto es obligatorio");
        return;
      }

      const priceValue = Number.parseFloat(productForm.price);
      if (Number.isNaN(priceValue)) {
        notify("error", "Ingresá un precio válido");
        return;
      }

      const discountValue =
        productForm.discount === ""
          ? 0
          : Number.parseFloat(productForm.discount);
      if (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 1) {
        notify("error", "El descuento debe estar entre 0 y 1");
        return;
      }

      const stockValue =
        productForm.stock === ""
          ? 0
          : Number.parseInt(productForm.stock, 10);
      if (Number.isNaN(stockValue) || stockValue < 0) {
        notify("error", "El stock no es válido");
        return;
      }

      const categoryValue = Number.parseInt(productForm.category_id, 10);
      if (Number.isNaN(categoryValue)) {
        notify("error", "Seleccioná una categoría válida");
        return;
      }

      const payload = {
        name: trimmedName,
        description: productForm.description,
        price: priceValue,
        discount: discountValue,
        size: productForm.size ? productForm.size.toUpperCase() : null,
        stock: stockValue,
        category_id: categoryValue,
        image_url: productForm.image_url || null,
      };

      await createProduct(payload);
      notify("success", "Producto cargado correctamente");
      resetProductForm();
    } catch (error) {
      console.error(error);
      notify("error", error.message || "Ocurrió un error al cargar el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = useMemo(
    () =>
      isSubmitting ||
      isLoadingCategories ||
      !productForm.name.trim() ||
      !productForm.price ||
      !productForm.stock ||
      !productForm.size ||
      !productForm.category_id,
    [isSubmitting, isLoadingCategories, productForm]
  );

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Panel de Vendedor</h1>
          <p className="admin-subtitle">
            Cargá nuevos productos para que aparezcan en la tienda.
          </p>
        </div>
        <button
          type="button"
          className="admin-refresh"
          onClick={fetchCategories}
          disabled={isLoadingCategories || isSubmitting}
        >
          Actualizar categorías
        </button>
      </header>

      {status && <div className={`admin-alert ${status.type}`}>{status.message}</div>}

      {isLoadingCategories && categories.length === 0 && (
        <div className="admin-loading">Cargando categorías...</div>
      )}

      <section className="admin-section">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Cargar producto</h2>
            <span>{categories.length} categorías disponibles</span>
          </div>

          <form className="admin-form" onSubmit={handleProductSubmit}>
            <h3>Datos del producto</h3>
            <div className="admin-form-grid">
              <label>
                Nombre
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleProductChange}
                  required
                />
              </label>
              <label>
                Precio
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={productForm.price}
                  onChange={handleProductChange}
                  required
                />
              </label>
              <label>
                Stock
                <input
                  type="number"
                  min="0"
                  name="stock"
                  value={productForm.stock}
                  onChange={handleProductChange}
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
                  value={productForm.discount}
                  onChange={handleProductChange}
                />
              </label>
              <label>
                Imagen (URL)
                <input
                  type="url"
                  name="image_url"
                  value={productForm.image_url}
                  onChange={handleProductChange}
                />
              </label>
              <label className="full-width">
                Descripción
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductChange}
                  rows={3}
                />
              </label>
              <label>
                Talle
                <select
                  name="size"
                  value={productForm.size}
                  onChange={handleProductChange}
                  required
                >
                  <option value="">Seleccionar talle</option>
                  {SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Categoría
                <select
                  name="category_id"
                  value={productForm.category_id}
                  onChange={handleProductChange}
                  required
                  disabled={categories.length === 0}
                >
                  <option value="">
                    {categories.length === 0
                      ? "No hay categorías disponibles"
                      : "Seleccionar categoría"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.description ?? `ID ${category.id}`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-button primary"
                disabled={isSubmitDisabled}
              >
                {isSubmitting ? "Cargando..." : "Cargar producto"}
              </button>
              <button
                type="button"
                className="admin-button ghost"
                onClick={resetProductForm}
                disabled={isSubmitting}
              >
                Limpiar formulario
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default SellerView;