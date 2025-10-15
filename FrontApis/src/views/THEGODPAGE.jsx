import { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  getUsers,
  updateUser,
  deleteUser,
} from "../services/adminService";

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

const EMPTY_CATEGORY = {
  name: "",
  description: "",
};

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "SELLER", label: "Seller" },
  { value: "USER", label: "Usuario" },
];

const toNumberOrEmpty = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? "" : String(parsed);
};

const SIZE_OPTIONS = ["S", "M", "L", "XL"];

const toDisplayValue = (value) => (value === null || value === undefined ? "" : value);

function THEGODPAGE() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY);

  const [userDrafts, setUserDrafts] = useState({});

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const notify = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 5000);
  };

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : data?.content || []);
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudieron cargar los productos");
      setProducts([]);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : data?.content || []);
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudieron cargar las categorías");
      setCategories([]);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : data?.content || []);
      setUserDrafts({});
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudieron cargar los usuarios");
      setUsers([]);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      await Promise.all([loadProducts(), loadCategories(), loadUsers()]);
      setLoading(false);
      setInitialLoad(false);
    };

    bootstrap();
  }, []);

  const resetProductForm = () => {
    setProductForm(EMPTY_PRODUCT);
    setSelectedProductId(null);
  };

  const handleProductChange = (event) => {
    const { name, value } = event.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const trimmedName = productForm.name.trim();
      if (!trimmedName) {
        notify("error", "El nombre del producto es obligatorio");
        setLoading(false);
        return;
      }

      const priceValue = Number.parseFloat(productForm.price);
      if (Number.isNaN(priceValue)) {
        notify("error", "Ingresá un precio válido");
        setLoading(false);
        return;
      }

      const discountValue =
        productForm.discount === ""
          ? 0
          : Number.parseFloat(productForm.discount);
      if (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 1) {
        notify("error", "El descuento debe estar entre 0 y 1");
        setLoading(false);
        return;
      }

      const stockValue =
        productForm.stock === ""
          ? 0
          : Number.parseInt(productForm.stock, 10);
      if (Number.isNaN(stockValue) || stockValue < 0) {
        notify("error", "El stock no es válido");
        setLoading(false);
        return;
      }

      const categoryValue = Number.parseInt(productForm.category_id, 10);
      if (Number.isNaN(categoryValue)) {
        notify("error", "Seleccioná una categoría válida");
        setLoading(false);
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
      if (selectedProductId) {
        await updateProduct(selectedProductId, payload);
        notify("success", "Producto actualizado correctamente");
      } else {
        await createProduct(payload);
        notify("success", "Producto creado correctamente");
      }
      await loadProducts();
      resetProductForm();
    } catch (error) {
      console.error(error);
      notify("error", error.message || "Ocurrió un error con el producto");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProductId(product?.id ?? null);
    const sizeValue = toDisplayValue(product?.size);
    setProductForm({
      name: toDisplayValue(product?.name ?? product?.title),
      description: toDisplayValue(product?.description),
      price: toNumberOrEmpty(product?.price),
      discount: toNumberOrEmpty(product?.discount),
      size: sizeValue ? String(sizeValue).toUpperCase() : "",
      stock: toNumberOrEmpty(product?.stock),
      category_id: toNumberOrEmpty(
        product?.category_id ?? product?.categoryId ?? product?.category?.id
      ),
      image_url: toDisplayValue(
        product?.image_url ?? product?.imageUrl ?? product?.image
      ),
    });
  };

  const handleDeleteProduct = async (id) => {
    if (!id) return;
    const confirmed = window.confirm("¿Eliminar este producto?");
    if (!confirmed) return;
    setLoading(true);
    try {
      await deleteProduct(id);
      notify("success", "Producto eliminado");
      await loadProducts();
      if (selectedProductId === id) {
        resetProductForm();
      }
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudo eliminar el producto");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event) => {
    const { name, value } = event.target;
    setCategoryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    if (!categoryForm.name.trim()) {
      notify("error", "La categoría necesita un nombre");
      return;
    }
    setLoading(true);
    try {
      await createCategory(categoryForm);
      notify("success", "Categoría creada correctamente");
      setCategoryForm(EMPTY_CATEGORY);
      await loadCategories();
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudo crear la categoría");
    } finally {
      setLoading(false);
    }
  };

  const handleUserDraftChange = (id, field, value) => {
    setUserDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
  };

  const handleUserSave = async (user) => {
    if (!user?.id) return;
    const payload = {
      ...user,
      ...(userDrafts[user.id] || {}),
    };
    setLoading(true);
    try {
      await updateUser(user.id, payload);
      notify("success", "Usuario actualizado");
      await loadUsers();
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudo actualizar el usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!id) return;
    const confirmed = window.confirm("¿Eliminar este usuario?");
    if (!confirmed) return;
    setLoading(true);
    try {
      await deleteUser(id);
      notify("success", "Usuario eliminado");
      await loadUsers();
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudo eliminar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Panel de Administración</h1>
          <p className="admin-subtitle">
            Gestioná productos, categorías y usuarios desde un solo lugar.
          </p>
        </div>
        <button
          type="button"
          className="admin-refresh"
          onClick={() => {
            setLoading(true);
            Promise.all([loadProducts(), loadCategories(), loadUsers()])
              .catch(() => null)
              .finally(() => setLoading(false));
          }}
        >
          Refrescar todo
        </button>
      </header>

      {status && (
        <div className={`admin-alert ${status.type}`}>
          {status.message}
        </div>
      )}

      {loading && initialLoad && (
        <div className="admin-loading">Cargando información...</div>
      )}

      <section className="admin-section">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Productos</h2>
            <span>{products.length} en total</span>
          </div>
          <div className="admin-list">
            {products.map((product) => {
              const discountValue = Number(product.discount ?? 0);
              const hasDiscount = Number.isFinite(discountValue) && discountValue > 0;
              const categoryIdValue =
                product.category_id ??
                product.categoryId ??
                product.category?.id ??
                null;
              const categoryLabel =
                (categoryIdValue !== null
                  ? categories.find(
                      (category) =>
                        String(category.id) === String(categoryIdValue)
                    )?.name
                  : null) ||
                product.category?.name ||
                product.category_name ||
                categoryIdValue;
              return (
                <article
                  key={product.id || product.name || product.title}
                  className="admin-item"
                >
                  <div className="admin-item-main">
                    <h3>{product.name || product.title || `Producto #${product.id}`}</h3>
                    <p className="admin-item-meta">
                      ID: {product.id ?? "-"} · Precio: ${product.price ?? "-"} · Stock: {product.stock ?? "-"}
                    </p>
                    <p className="admin-item-meta">
                      Descuento: {hasDiscount
                        ? `${(discountValue * 100).toFixed(0)}%`
                        : "Sin descuento"}
                    </p>
                    {product.size && (
                      <p className="admin-item-meta">Talle: {product.size}</p>
                    )}
                    {categoryLabel && (
                      <p className="admin-item-meta">
                        Categoría: {categoryLabel}
                      </p>
                    )}
                  </div>
                  <div className="admin-item-actions">
                    <button
                      type="button"
                      className="admin-button"
                      onClick={() => handleEditProduct(product)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="admin-button danger"
                      onClick={() => handleDeleteProduct(product.id)}
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

          <form className="admin-form" onSubmit={handleProductSubmit}>
            <h3>{selectedProductId ? "Editar producto" : "Crear producto"}</h3>
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
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.description}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="admin-form-actions">
              {selectedProductId && (
                <button
                  type="button"
                  className="admin-button ghost"
                  onClick={resetProductForm}
                >
                  Cancelar edición
                </button>
              )}
              <button type="submit" className="admin-button primary" disabled={loading}>
                {selectedProductId ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="admin-section two-columns">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Categorías</h2>
            <span>{categories.length} registradas</span>
          </div>
          <ul className="admin-list compact">
            {categories.map((category) => (
              <li key={category.id || category.name} className="admin-item">
                <div className="admin-item-main">
                  <h3>{category.name || `Categoría #${category.id}`}</h3>
                  {category.description && (
                    <p className="admin-item-meta">{category.description}</p>
                  )}
                </div>
              </li>
            ))}
            {categories.length === 0 && (
              <p className="admin-empty">No hay categorías disponibles.</p>
            )}
          </ul>
          <form className="admin-form" onSubmit={handleCategorySubmit}>
            <h3>Nueva categoría</h3>
            <label>
              Nombre
              <input
                type="text"
                name="name"
                value={categoryForm.name}
                onChange={handleCategoryChange}
                required
              />
            </label>
            <label>
              Descripción
              <textarea
                name="description"
                value={categoryForm.description}
                onChange={handleCategoryChange}
                rows={3}
              />
            </label>
            <button type="submit" className="admin-button primary" disabled={loading}>
              Crear categoría
            </button>
          </form>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Usuarios</h2>
            <span>{users.length} registrados</span>
          </div>
          <div className="admin-list">
            {users.map((user) => {
              const draft = userDrafts[user.id] || {};
              const roleValue = draft.role ?? user.role ?? "";
              return (
                <article key={user.id || user.email} className="admin-item">
                  <div className="admin-item-main">
                    <h3>
                      {user.firstname || user.firstName || ""} {user.lastname || user.lastName || ""}
                    </h3>
                    <p className="admin-item-meta">ID: {user.id ?? "-"}</p>
                    {user.email && (
                      <p className="admin-item-meta">{user.email}</p>
                    )}
                    <label className="admin-inline-field">
                      Rol
                      <select
                        value={roleValue}
                        onChange={(event) =>
                          handleUserDraftChange(user.id, "role", event.target.value)
                        }
                      >
                        <option value="">Seleccionar rol</option>
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="admin-item-actions">
                    <button
                      type="button"
                      className="admin-button"
                      onClick={() => handleUserSave(user)}
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="admin-button danger"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              );
            })}
            {users.length === 0 && (
              <p className="admin-empty">No hay usuarios disponibles.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default THEGODPAGE;