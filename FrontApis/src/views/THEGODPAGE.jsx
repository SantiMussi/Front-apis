import { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  getUsers,
} from "../services/adminService";
import { toDisplayValue, toNumberOrEmpty } from "../helpers/valueConverter";

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
  description: "",
};

const SIZE_OPTIONS = ["S", "M", "L", "XL"];

const formatRole = (role) => {
  if (role === null || role === undefined || role === "") {
    return "Sin rol";
  }

  if (typeof role === "string") {
    return role.trim() ? role.trim().toUpperCase() : "Sin rol";
  }

  return String(role);
};

const normalizeUserRecord = (user, index) => {
  console.log(user)
  if (Array.isArray(user)) {
    const [email, tank_variable, firstName, lastName, user_id, role] = user;
    return { 
      email: email || "",
      id: user_id,
      first_name: firstName || "",
      last_name: lastName || "",
      role: role ?? "",
    };
  }

  return {
    email: user?.email ?? "",
    first_name: user?.first_name ?? user?.firstName ?? user?.firstname ?? "",
    last_name: user?.last_name ?? user?.lastName ?? user?.lastname ?? "",
    role: user?.role ?? "",
  };
};


const TESTING_TIME = (users) => {
      users.forEach(user => {
        console.log(user)
      });
}

function THEGODPAGE() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY);

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
      const rawUsers = Array.isArray(data) ? data : data?.content || [];
      console.log(rawUsers)
      setUsers(rawUsers.map((user, index) => normalizeUserRecord(user, index)));
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
    const trimmedDescription = categoryForm.description.trim();
    if (!trimmedDescription) {
      notify("error", "La categoría necesita una descripción");
      return;
    }
    setLoading(true);
    try {
      await createCategory({ description: trimmedDescription });
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
            TESTING_TIME(users)
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
                    )?.description
                  : null) ||
                product.category?.description ||
                product.category_description ||
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
                      {category.description ?? `ID ${category.id}`}
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
              <li key={category.id} className="admin-item">
                <div className="admin-item-main">
                  <h3>{category.description || `Categoría #${category.id}`}</h3>
                  <p className="admin-item-meta">ID: {category.id ?? "-"}</p>
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
              Descripción
              <input
                type="text"
                name="description"
                value={categoryForm.description}
                onChange={handleCategoryChange}
                placeholder="Descripción de la categoría"
                required
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
          <div className="admin-list users">
            {users.map((user) => {
              const emailValue = user.email || "";
              const firstNameValue = user.first_name || "";
              const lastNameValue = user.last_name || "";
              const roleValue = user.role ?? "";
              const displayName = [firstNameValue, lastNameValue]
                .filter(Boolean)
                .join(" ")
                .trim();
              return (
                <article key={user.id || user.email || emailValue || displayName} className="admin-item">
                  <div className="admin-item-main">
                    <h3>{displayName || "Usuario sin nombre"}</h3>
                    <p className="admin-item-meta">{emailValue || "Sin email"}</p>
                    <p className="admin-item-meta">Rol: {formatRole(roleValue)}</p>
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