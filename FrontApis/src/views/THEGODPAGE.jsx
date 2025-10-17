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
} from "../services/adminService";
import { getCurrentUser, hasRole } from "../services/authService";
import { EMPTY_PRODUCT } from "../constants/product";
import ProductList from "../components/Panels/ProductList";
import ProductForm from "../components/Panels/ProductForm";
import CategoryList from "../components/Panels/CategoryList";
import UserList from "../components/Panels/UserList";
import StatusAlert from "../components/Panels/StatusAlert";
import { normalizeUserRecord } from "../helpers/userAdmin";

const EMPTY_CATEGORY = { description: "" };

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
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // muestra notificaciones temporales en pantalla
  const notify = (type, message) => {
      setStatus({ type, message });
      window.clearTimeout(notify.timeoutId);
      notify.timeoutId = window.setTimeout(() => setStatus(null), 5000);
    };

  // carga productos desde la API
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

  // carga categorías desde la API
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

   // cambia de forma optimista el rol de usuario
  const handleUserRoleChange = async (user, newRole) => {
    const normalizedRole = (newRole || "").trim().toUpperCase();

    if (!normalizedRole) {
      notify("error", "Seleccioná un rol válido");
      return;
    }

    if (!user?.id) {
      notify("error", "No se puede actualizar un usuario sin identificador");
      return;
    }

    const previousRole = user.role ?? "";

    setUsers((prevUsers) =>
      prevUsers.map((item) =>
        item.id === user.id
          ? {
              ...item,
              role: normalizedRole,
            }
          : item
      )
    );

    setUpdatingUserId(user.id);
    try {
      await updateUser(user.id, { role: normalizedRole });
      notify("success", "Rol actualizado correctamente");
    } catch (error) {
      // revertir en caso de error
      setUsers((prevUsers) =>
        prevUsers.map((item) =>
          item.id === user.id
            ? {
                ...item,
                role: previousRole,
              }
            : item
        )
      );
      notify(
        "error",
        error.message || "No se pudo actualizar el rol del usuario"
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  // carga usuarios
  const loadUsers = async () => {
    try {
      const data = await getUsers();
      const rawUsers = Array.isArray(data) ? data : data?.content || [];
      setUsers(rawUsers.map((user, index) => normalizeUserRecord(user, index)));
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudieron cargar los usuarios");
      setUsers([]);
    }
  };

  // bootstrap inicial: carga productos, categorías y usuarios
  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      await Promise.all([loadProducts(), loadCategories(), loadUsers()]);
      setLoading(false);
      setInitialLoad(false);
    };

    bootstrap(); // ejecutar carga inicial

    // limpiar timeouts cuando el componente se desmonta
    return () => {
      if (notify.timeoutId) {
        window.clearTimeout(notify.timeoutId);
      }
    };
  }, []);

  // decide si ocultar usuarios ADMIN según rol del actual
  const shouldHideAdminUsers = hasRole("ADMIN");

  const visibleUsers = users.filter((user) => {
    const roleValue = (user?.role ?? "").toString().trim().toUpperCase();
    return !(shouldHideAdminUsers && roleValue === "ADMIN");
  });

  // resetea el formulario de producto (propaga a ProductForm)
  const resetProductForm = () => {
    setProductForm(EMPTY_PRODUCT);
    setSelectedProductId(null);
  };

  // maneja cambios en inputs del formulario de producto
  const handleProductChange = (event) => {
    const { name, value } = event.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // envío del formulario de producto (crear o actualizar)
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

      const categoryValue = Number.parseInt(productForm.categoryId, 10);
      if (Number.isNaN(categoryValue)) {
        notify("error", "Seleccioná una categoría válida");
        setLoading(false);
        return;
      }

      const currentUser = await getCurrentUser();
      if (!currentUser?.id) {
        notify("error", "No se pudo identificar al creador del producto");
        setLoading(false);
        return;
      }

      // payload normalizado para la API
      const payload = {
        name: trimmedName,
        description: productForm.description,
        price: priceValue,
        discount: discountValue,
        size: productForm.size ? productForm.size.toUpperCase() : null,
        stock: stockValue,
        categoryId: categoryValue,
        base64img: productForm.base64img || null,
        creator_id: currentUser.id,
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

  // prepara el formulario para editar un producto (se propaga a ProductList)
  const handleEditProduct = (formValues, productId) => {
    setSelectedProductId(productId ?? null);
    setProductForm(formValues);
  };

  // elimina un producto (se propaga a ProductList)
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

  // maneja cambios del formulario de categoría 
  const handleCategoryChange = (event) => {
    const { name, value } = event.target;
    setCategoryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // crea una nueva categoría
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

  // recarga todo (productos, categorías, usuarios)
  const refreshAll = () => {
    setLoading(true);
    Promise.all([loadProducts(), loadCategories(), loadUsers()])
      .catch(() => null)
      .finally(() => setLoading(false));
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
          onClick={refreshAll}
        >
          Refrescar todo
        </button>
      </header>

      <StatusAlert status={status}/>

      {loading && initialLoad && (
        <div className="admin-loading">Cargando información...</div>
      )}

      <section className="admin-section">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Productos</h2>
            <span>{products.length} en total</span>
          </div>
          <ProductList
            products={products}
            categories={categories}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />

          <ProductForm
            title={selectedProductId ? "Editar producto" : "Crear producto"}
            product={productForm}
            categories={categories}
            onChange={handleProductChange}
            onSubmit={handleProductSubmit}
            onCancel={selectedProductId ? resetProductForm : undefined}
            submitLabel={selectedProductId ? "Actualizar" : "Crear"}
            isSubmitting={loading}
          />
          
        </div>
      </section>

      <section className="admin-section two-columns">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Categorías</h2>
            <span>{categories.length} registradas</span>
          </div>

          <CategoryList categories={categories} />

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
            <button
              type="submit"
              className="admin-button primary"
              disabled={loading}
            >
              Crear categoría
            </button>
          </form>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Usuarios</h2>
            <span>{visibleUsers.length} registrados</span>
          </div>
          <UserList
            users={visibleUsers}
            onRoleChange={handleUserRoleChange}
            updatingUserId={updatingUserId}
          />
        </div>
      </section>
    </div>
  );
}

export default THEGODPAGE;