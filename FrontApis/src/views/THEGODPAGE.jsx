import { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, createCategory, getUsers, updateUser, getCoupons, createCoupon, deleteCoupon } from "../services/adminService";
import { authHeader, getCurrentUser, hasRole } from "../services/authService";
import { EMPTY_PRODUCT } from "../constants/product";
import ProductList from "../components/Panels/ProductList";
import ProductForm from "../components/Panels/ProductForm";
import CategoryList from "../components/Panels/CategoryList";
import UserList from "../components/Panels/UserList";
import StatusAlert from "../components/Panels/StatusAlert";
import CouponPanel from "../components/Panels/CouponPanel";
import { normalizeUserRecord } from "../helpers/userAdmin";
import { normalizePage } from "../helpers/orderHelpers";
import OrderCard from "../components/OrderComponents/OrderCard";

const EMPTY_CATEGORY = { description: "" };
const BASE_URL = import.meta.env.VITE_API_URL

function THEGODPAGE() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discount: "",
    expirationDate: "",
  });

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Órdenes recibidas
  const [orders, setOrders] = useState([]);
  const [soPage, setSoPage] = useState(0);
  const [soSize] = useState(10);
  const [soTotalPages, setSoTotalPages] = useState(1);
  const [isLoadingadminOrders, setIsLoadingAdminOrders] = useState(true);
  const [adminOrdersErr, setAdminOrdersErr] = useState("");


  const fetchAdminOrders = async () => {
    setIsLoadingAdminOrders(true);
    setAdminOrdersErr("");
    try {
      let res = await fetch(`${BASE_URL}/orders`, {
        headers: { "Content-Type": "application/json", ...authHeader() }, credentials: "include"
      })
      
      if (res.status === 401) { setSoTotalPages(1); setAdminOrdersErr(""); return; }
      if (res.status === 204 || res.status === 404) { setSoTotalPages(1); setAdminOrdersErr(""); return; }
      if (!res.ok) {
        await res.text().catch(() => null);
        throw new Error("No pudimos cargar tus órdenes recibidas.");
      }

      const data = await res.json();
      const n = normalizePage(data);
      const allOrders = Array.isArray(n.items) ? n.items : [];

      // si la API no devuelve paginado real, mantiene una sola página
      setSoTotalPages(n.totalPages || 1);
      setAdminOrdersErr("");
      setOrders(allOrders)
    } catch (e) {
      setAdminOrdersErr(e?.message || "No pudimos cargar tus órdenes recibidas.");
      setSoTotalPages(1);
    } finally {
      setIsLoadingAdminOrders(false);
    }
  };



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

  // carga cupones
  const loadCoupons = async () => {
    try {
      const data = await getCoupons();
      setCoupons(Array.isArray(data) ? data : data?.content || []);
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudieron cargar los cupones");
      setCoupons([]);
    }
  };

  const loadOrders = async () => {
    fetchAdminOrders();
  }

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
      await Promise.all([loadProducts(), loadCategories(), loadUsers(), loadCoupons()]);
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

  // Recarga órdenes cuando cambia la página
  useEffect(() => {
    fetchAdminOrders();
  }, [soPage]);

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
    Promise.all([loadProducts(), loadCategories(), loadUsers(), loadCoupons(), loadOrders()])
      .catch(() => null)
      .finally(() => setLoading(false));
  };

  const resetCouponForm = () => {
    setCouponForm({
      code: "",
      discount: "",
      expirationDate: "",
    });
  };

  const handleCouponChange = (event) => {
    const { name, value } = event.target;
    setCouponForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCouponSubmit = async (event) => {
    event.preventDefault();

    const trimmedCode = couponForm.code.trim();
    if (!trimmedCode) {
      notify("error", "El cupón necesita un código");
      return;
    }

    const discountValue = Number.parseFloat(couponForm.discount);
    if (Number.isNaN(discountValue) || discountValue <= 0 || discountValue >= 1) {
      notify("error", "El descuento debe ser un número entre 0 y 1");
      return;
    }

    if (!couponForm.expirationDate) {
      notify("error", "Seleccioná una fecha de expiración");
      return;
    }

    console.log(couponForm)
    setLoading(true);
    try {
      await createCoupon({
        code: trimmedCode,
        discount: discountValue,
        expirationDate: couponForm.expirationDate,
      });
      notify("success", "Cupón creado correctamente");
      resetCouponForm();
      await loadCoupons();
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudo crear el cupón");
    } finally {
      setLoading(false);
    }
  };

  const handleCouponDelete = async (couponId) => {
    if (!couponId) return;
    const confirmed = window.confirm("¿Eliminar este cupón?");
    if (!confirmed) return;
    setLoading(true);
    try {
      await deleteCoupon(couponId);
      notify("success", "Cupón eliminado correctamente");
      await loadCoupons();
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudo eliminar el cupón");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = async () => {
    return;
  }

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

      <StatusAlert status={status} />

      {loading && initialLoad && (
        <div className="admin-loading">Cargando información...</div>
      )}

      <div className="admin-grid">
        <section className="admin-section full-width">
          <div className="admin-card split">
            <div className="admin-card-header">
              <h2>Productos</h2>
              <span>{products.length} en total</span>
            </div>
            <div className="admin-card-block">
              <ProductList
                products={products}
                categories={categories}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            </div>
            <div className="admin-card-block">
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
          </div>
        </section>

        <CouponPanel
          coupons={coupons}
          couponForm={couponForm}
          onChange={handleCouponChange}
          onSubmit={handleCouponSubmit}
          onDelete={handleCouponDelete}
          loading={loading}
        />
        <section className="admin-section">
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
        </section>
        <section className="admin-section">
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

      {/* Órdenes recibidas */}
      <section className="admin-section">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Mis órdenes recibidas</h2>
            <span>{isLoadingadminOrders ? "—" : `${orders.length} en esta página`}</span>
          </div>

          {isLoadingadminOrders && <div className="admin-loading">Cargando órdenes...</div>}

          {!isLoadingadminOrders && adminOrdersErr && (
            <div className="admin-alert error">{adminOrdersErr}</div>
          )}

          {!isLoadingadminOrders && !adminOrdersErr && orders.length === 0 && (
            <div className="no-product">Aún no recibiste órdenes</div>
          )}

          {!isLoadingadminOrders && !adminOrdersErr && orders.length > 0 && (
            <section className="orders-list">
              {orders.map((o) => (
                <OrderCard
                  key={o?.id ?? o?.orderId ?? crypto.randomUUID()}
                  order={o}
                  variant="ADMIN"
                />
              ))}
            </section>
          )}

          {!isLoadingadminOrders && soTotalPages > 1 && (
            <div className="orders-pagination">
              <button
                className="admin-button"
                onClick={() => setSoPage((p) => Math.max(0, p - 1))}
                disabled={soPage === 0}
              >
                Anterior
              </button>
              <span className="orders-page-indicator">
                Página {soPage + 1} de {soTotalPages}
              </span>
              <button
                className="admin-button"
                onClick={() => setSoPage((p) => Math.min(soTotalPages - 1, p + 1))}
                disabled={soPage >= soTotalPages - 1}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </section>
    </div>

  );
}

export default THEGODPAGE;