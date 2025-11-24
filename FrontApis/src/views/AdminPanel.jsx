import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2"; // npm install sweetalert2

import {
  fetchProducts as fetchProductsThunk,
  createProduct as createProductThunk,
  updateProduct as updateProductThunk,
  deleteProduct as deleteProductThunk,
} from "../redux/productsSlice";

import {
  fetchCategories as fetchCategoriesThunk,
  createCategory as createCategoryThunk,
  updateCategory as updateCategoryThunk,
  deleteCategory as deleteCategoryThunk,
} from "../redux/categoriesSlice";

import {
  fetchCoupons as fetchCouponsThunk,
  createCoupon as createCouponThunk,
  deleteCoupon as deleteCouponThunk,
} from "../redux/couponsSlice";

import {
  fetchUsers as fetchUsersThunk,
  updateUser as updateUserThunk,
} from "../redux/usersSlice";

import { getCurrentUser, hasRole } from "../services/authService";
import { EMPTY_PRODUCT } from "../constants/product";
import ProductList from "../components/Panels/ProductList";
import ProductForm from "../components/Panels/ProductForm";
import CategoryList from "../components/Panels/CategoryList";
import UserList from "../components/Panels/UserList";
import StatusAlert from "../components/Panels/StatusAlert";
import CouponPanel from "../components/Panels/CouponPanel";
import { normalizeUserRecord } from "../helpers/userAdmin";
import Collapsible from "../components/Collapsible/Collapsible";
import OrderPanel from "../components/Panels/OrderPanel";

const EMPTY_CATEGORY = { description: "" };

function THEGODPAGE() {

  const dispatch = useDispatch();

  const { products } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const { coupons } = useSelector((state) => state.coupons);
  const { users: rawUsers } = useSelector((state) => state.users);

  const [editingCategory, setEditingCategory] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);

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

  // Acordeón
  const [openPanel, setOpenPanel] = useState("");
  const togglePanel = (id) => {
    setOpenPanel((curr) => (curr === id ? null : id));
  };

  // Notificaciones
  const notify = (type, message) => {
    setStatus({ type, message });
    window.clearTimeout(notify.timeoutId);
    notify.timeoutId = window.setTimeout(() => setStatus(null), 5000);
  };

  // productos
  const loadProducts = async () => {
    const action = dispatch(fetchProductsThunk());
    if (fetchProductsThunk.rejected.match(action)) {
      const msg =
        action.error?.message || "No se pudieron cargar los productos";
      notify("error", msg);
    }
  };

  // categorías (get público)
  const loadCategories = async () => {
    const action = dispatch(fetchCategoriesThunk());
    if (fetchCategoriesThunk.rejected.match(action)) {
      const msg =
        action.error?.message || "No se pudieron cargar las categorías";
      notify("error", msg);
    }
  };

  // carga cupones
  const loadCoupons = async () => {
    const action = dispatch(fetchCouponsThunk());
    if (fetchCouponsThunk.rejected.match(action)) {
      const msg =
        action.error?.message || "No se pudieron cargar los cupones";
      notify("error", msg);
    }
  };

  const loadOrders = async () => {
    // si tenés una función fetchAdminOrders en otro lado, se usa acá
    fetchAdminOrders?.();
  };

  // carga usuarios (Redux)
  const loadUsers = async () => {
    const action = dispatch(fetchUsersThunk());
    if (fetchUsersThunk.rejected.match(action)) {
      const msg =
        action.error?.message || "No se pudieron cargar los usuarios";
      notify("error", msg);
    }
  };

  // cambia de forma controlada el rol de usuario usando Redux
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

    setUpdatingUserId(user.id);

    try {
      const actionResult = await dispatch(
        updateUserThunk({
          id: user.id,
          user: { role: normalizedRole },
        })
      );

      if (actionResult.meta.requestStatus === "fulfilled") {
        notify("success", "Rol actualizado correctamente");
      } else {
        const errMsg =
          actionResult.error?.message ||
          "No se pudo actualizar el rol del usuario";
        notify("error", errMsg);
      }
    } catch (error) {
      notify(
        "error",
        error.message || "No se pudo actualizar el rol del usuario"
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  // bootstrap inicial
  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadUsers(),
        loadCoupons(),
      ]);
      setLoading(false);
      setInitialLoad(false);
    };

    bootstrap();

    return () => {
      if (notify.timeoutId) {
        window.clearTimeout(notify.timeoutId);
      }
    };
  }, []);

  // decide si ocultar usuarios ADMIN según rol del actual
  const shouldHideAdminUsers = hasRole("ADMIN");

  // normalizamos usuarios al leer desde Redux
  const normalizedUsers = (rawUsers || []).map((user, index) =>
    normalizeUserRecord(user, index)
  );

  const visibleUsers = normalizedUsers.filter((user) => {
    const roleValue = (user?.role ?? "").toString().trim().toUpperCase();
    return !(shouldHideAdminUsers && roleValue === "ADMIN");
  });

  // PRODUCTOS

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
      if (
        Number.isNaN(discountValue) ||
        discountValue < 0 ||
        discountValue > 1
      ) {
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

      let resultAction;
      if (selectedProductId) {
        resultAction = await dispatch(
          updateProductThunk({
            id: selectedProductId,
            payload,
          })
        );
      } else {
        resultAction = await dispatch(createProductThunk(payload));
      }

      if (resultAction.meta.requestStatus === "fulfilled") {
        notify(
          "success",
          selectedProductId
            ? "Producto actualizado correctamente"
            : "Producto creado correctamente"
        );
        await dispatch(fetchProductsThunk());
        resetProductForm();
      } else {
        const errMsg =
          resultAction.error?.message || "Ocurrió un error con el producto";
        notify("error", errMsg);
      }
    } catch (error) {
      notify("error", error.message || "Ocurrió un error con el producto");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (formValues, productId) => {
    setSelectedProductId(productId ?? null);
    setProductForm(formValues);
  };

  const handleDeleteProduct = async (id) => {
    if (!id) return;

    const result = await Swal.fire({
      title: "¿Eliminar este producto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#444",
      background: "#111",
      color: "#fff",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const actionResult = await dispatch(deleteProductThunk(id));

      if (actionResult.meta.requestStatus === "fulfilled") {
        notify("success", "Producto eliminado");
        await dispatch(fetchProductsThunk());
        if (selectedProductId === id) {
          resetProductForm();
        }
      } else {
        const errMsg =
          actionResult.error?.message || "No se pudo eliminar el producto";
        notify("error", errMsg);
      }
    } catch (error) {
      notify("error", error.message || "No se pudo eliminar el producto");
    } finally {
      setLoading(false);
    }
  };

  // CATEGORÍAS
  const handleCategoryChange = (event) => {
    const { name, value } = event.target;
    setCategoryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditCategoryClick = (category) => {
    setEditingCategory({ ...category });
  };

  const handleEditCategoryChange = (e) => {
    const { value } = e.target;
    setEditingCategory((prev) => ({ ...prev, description: value }));
  };

  const handleEditCategoryCancel = () => {
    setEditingCategory(null);
  };

  const handleEditCategorySave = async (e) => {
    e?.preventDefault?.();
    if (!editingCategory?.id) return;
    const desc = (editingCategory.description ?? "").trim();
    if (!desc) {
      notify("error", "La descripción no puede estar vacía");
      return;
    }
    try {
      setSavingCategory(true);

      const actionResult = await dispatch(
        updateCategoryThunk({
          id: editingCategory.id,
          description: desc,
        })
      );

      if (actionResult.meta.requestStatus === "fulfilled") {
        notify("success", "Categoria actualizada");
        setEditingCategory(null);
        await loadCategories();
      } else {
        const errMsg =
          actionResult.error?.message ||
          "No se pudo actualizar la categoría";
        notify("error", errMsg);
      }
    } catch (err) {
      notify(
        "error",
        err.message || "No se pudo actualizar la categoría"
      );
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!category?.id) return;

    const result = await Swal.fire({
      title: "¿Eliminar categoría?",
      text: `Se va a eliminar "${category.label}" (ID ${category.id})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#444",
      background: "#111",
      color: "#fff",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const actionResult = await dispatch(
        deleteCategoryThunk(category.id)
      );

      if (actionResult.meta.requestStatus === "fulfilled") {
        notify("success", "Categoría eliminada");
        await loadCategories();
      } else {
        const errMsg =
          actionResult.error?.message ||
          "No se pudo eliminar la categoría (puede estar en uso)";
        notify("error", errMsg);
      }
    } catch (err) {
      notify(
        "error",
        err.message ||
          "No se pudo eliminar la categoría (puede estar en uso)"
      );
    } finally {
      setLoading(false);
    }
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
      const actionResult = await dispatch(
        createCategoryThunk({ description: trimmedDescription })
      );

      if (actionResult.meta.requestStatus === "fulfilled") {
        notify("success", "Categoría creada correctamente");
        setCategoryForm(EMPTY_CATEGORY);
        await loadCategories();
      } else {
        const errMsg =
          actionResult.error?.message || "No se pudo crear la categoría";
        notify("error", errMsg);
      }
    } catch (error) {
      notify(
        "error",
        error.message || "No se pudo crear la categoría"
      );
    } finally {
      setLoading(false);
    }
  };

  // recarga todo
  const refreshAll = () => {
    setLoading(true);
    Promise.all([
      loadProducts(),
      loadCategories(),
      loadUsers(),
      loadCoupons(),
      loadOrders(),
    ])
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
    if (
      Number.isNaN(discountValue) ||
      discountValue < 0 ||
      discountValue > 1
    ) {
      notify("error", "El descuento debe ser un número entre 0 y 1");
      return;
    }

    if (!couponForm.expirationDate) {
      notify("error", "Seleccioná una fecha de expiración");
      return;
    } else if(couponForm.expirationDate < new Date().toISOString().split('T')[0]) {
      notify("error", "La fecha de expiración no puede ser en el pasado");
      return;
    }

    setLoading(true);
    try {
      const actionResult = await dispatch(
        createCouponThunk({
          code: trimmedCode,
          discount: discountValue,
          expirationDate: couponForm.expirationDate,
        })
      );

      if (actionResult.meta.requestStatus === "fulfilled") {
        notify("success", "Cupón creado correctamente");
        resetCouponForm();
        await loadCoupons();
      } else {
        const errMsg =
          actionResult.error?.response?.data?.message || "No se pudo crear el cupón";
        notify("error", errMsg);
      }
    } catch (error) {
      notify("error", error.message || "No se pudo crear el cupón");
    } finally {
      setLoading(false);
    }
  };

  const handleCouponDelete = async (couponId) => {
    if (!couponId) return;

    const result = await Swal.fire({
      title: "¿Eliminar este cupón?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#444",
      background: "#111",
      color: "#fff",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const actionResult = await dispatch(deleteCouponThunk(couponId));

      if (actionResult.meta.requestStatus === "fulfilled") {
        notify("success", "Cupón eliminado correctamente");
        await loadCoupons();
      } else {
        const errMsg =
          actionResult.error?.message || "No se pudo eliminar el cupón";
        notify("error", errMsg);
      }
    } catch (error) {
      notify("error", error.message || "No se pudo eliminar el cupón");
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
        <button type="button" className="admin-refresh" onClick={refreshAll}>
          Refrescar todo
        </button>
      </header>

      <StatusAlert status={status} onClose={() => setStatus(null)} />

      {loading && initialLoad && (
        <div className="admin-loading">Cargando información...</div>
      )}

      <div className="admin-grid">
        {/* Productos */}
        <section className="admin-section full-width">
          <Collapsible
            id="products"
            title="Productos"
            rightInfo={`${products.length} en total`}
            isOpen={openPanel === "products"}
            onToggle={togglePanel}
            className="split"
            contentClassName="split"
          >
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
                title={
                  selectedProductId ? "Editar producto" : "Crear producto"
                }
                product={productForm}
                categories={categories}
                onChange={handleProductChange}
                onSubmit={handleProductSubmit}
                onCancel={selectedProductId ? resetProductForm : undefined}
                submitLabel={selectedProductId ? "Actualizar" : "Crear"}
                isSubmitting={loading}
              />
            </div>
          </Collapsible>
        </section>

        {/* Cupones */}
        <section className="admin-section">
          <Collapsible
            id="coupons"
            title="Cupones"
            rightInfo={`${coupons.length} activos`}
            isOpen={openPanel === "coupons"}
            onToggle={togglePanel}
          >
            <CouponPanel
              coupons={coupons}
              couponForm={couponForm}
              onChange={handleCouponChange}
              onSubmit={handleCouponSubmit}
              onDelete={handleCouponDelete}
              loading={loading}
            />
          </Collapsible>
        </section>

        {/* Categorías */}
        <section className="admin-section">
          <Collapsible
            id="categories"
            title="Categorías"
            rightInfo={`${categories.length} registradas`}
            isOpen={openPanel === "categories"}
            onToggle={togglePanel}
          >
            <CategoryList
              categories={categories}
              onEdit={handleEditCategoryClick}
              onDelete={handleDeleteCategory}
            />

            {editingCategory ? (
              <form
                className="admin-form"
                onSubmit={handleEditCategorySave}
                style={{ marginTop: "1rem" }}
              >
                <h3>Editar categoría (ID: {editingCategory.id})</h3>
                <label>
                  Descripción
                  <input
                    type="text"
                    value={editingCategory.description ?? ""}
                    onChange={handleEditCategoryChange}
                    placeholder="Descripción de la categoría"
                    required
                  />
                </label>

                <div
                  className="admin-actions"
                  style={{ display: "flex", gap: ".5rem" }}
                >
                  <button
                    type="button"
                    className="admin-button"
                    onClick={handleEditCategoryCancel}
                    disabled={savingCategory}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="admin-button primary"
                    disabled={savingCategory}
                  >
                    {savingCategory ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            ) : (
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
            )}
          </Collapsible>
        </section>

        {/* Usuarios */}
        <section className="admin-section">
          <Collapsible
            id="users"
            title="Usuarios"
            rightInfo={`${visibleUsers.length} registrados`}
            isOpen={openPanel === "users"}
            onToggle={togglePanel}
          >
            <UserList
              users={visibleUsers}
              onRoleChange={handleUserRoleChange}
              updatingUserId={updatingUserId}
            />
          </Collapsible>
        </section>
      </div>

      <OrderPanel
        id="orders"
        isOpen={openPanel === "orders"}
        onToggle={togglePanel}
      />
    </div>
  );
}

export default THEGODPAGE;
