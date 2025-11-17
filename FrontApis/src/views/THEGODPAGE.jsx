import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getUsers,
  updateUser,
} from "../services/adminService";
import {
  fetchProducts as fetchProductsThunk,
} from "../redux/productsSlice";

import {
  fetchCategories as fetchCategoriesThunk,
  createCategory as createCategoryThunk,
  updateCategory as updateCategoryThunk,
  deleteCategory as deleteCategoryThunk
} from "../redux/categoriesSlice"
import {
  fetchCoupons as fetchCouponsThunk,
  createCoupon as createCouponThunk,
  deleteCoupon as deleteCouponThunk,
} from "../redux/couponsSlice";
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
import OrderPanel from "../components/Panels/OrderPanel"

const EMPTY_CATEGORY = { description: "" };

function THEGODPAGE() {
  const dispatch = useDispatch();

  const { products } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const { coupons } = useSelector((state) => state.coupons);

  const [editingCategory, setEditingCategory] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [users, setUsers] = useState([]);

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

  //Acordeon
  const [openPanel, setOpenPanel] = useState('');
  const togglePanel = (id) => {
    setOpenPanel((curr) => (curr === id ? null : id))
  }

  // muestra notificaciones temporales en pantalla
  const notify = (type, message) => {
    setStatus({ type, message });
    window.clearTimeout(notify.timeoutId);
    notify.timeoutId = window.setTimeout(() => setStatus(null), 5000);
  };

  // productos
  const loadProducts = async () => {
    try {
      await dispatch(fetchProductsThunk()).unwrap();
    } catch (error) {
      console.error(error);
      notify("error", error || "No se pudieron cargar los productos");
    }
  };

  // categorías (get publico)
  const loadCategories = async () => {
    try {
      await dispatch(fetchCategoriesThunk()).unwrap();
    }
    catch (error) {
      notify("error", error || 'No se pudieron cargar las categorías')
    }
  }

  // carga cupones
  const loadCoupons = async () => {
    try {
      await dispatch(fetchCouponsThunk()).unwrap();
    } catch (error) {
      console.error(error);
      notify("error", error || "No se pudieron cargar los cupones");
    }
  };

  const loadOrders = async () => {
    fetchAdminOrders();
  }

  // cambia de forma optimista el rol de usuario
  const handleUserRoleChange = async (user, newRole) => {
    const normalizedRole = (newRole || "").trim().toUpperCase();

    alert("Cambiando el rol de " + user?.first_name + " " + user?.last_name + " a " + newRole)

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

  // decide si ocultar usuarios ADMIN según rol del actual
  const shouldHideAdminUsers = hasRole("ADMIN");

  const visibleUsers = users.filter((user) => {
    const roleValue = (user?.role ?? "").toString().trim().toUpperCase();
    return !(shouldHideAdminUsers && roleValue === "ADMIN");
  });


  //PRODUCTOS
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

  //CATEGORIAS
  const handleCategoryChange = (event) => {
    const { name, value } = event.target;
    setCategoryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditCategoryClick = (category) => {
    setEditingCategory({ ...category }); // copia editable
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

      await dispatch(
        updateCategoryThunk({
          id: editingCategory.id,
          description: desc,
        })
      ).unwrap();

      notify("success", "Categoria actualizada");
      setEditingCategory(null);
      await loadCategories();
    } catch (err) {
      console.error(err);
      notify("error", err || "No se pudo actualizar la categoría")
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!category?.id) return;
    const ok = window.confirm(`¿Eliminar la categoría "${category.description}" (ID ${category.id})?`);
    if (!ok) return;

    try {
      setLoading(true);
      await dispatch(deleteCategoryThunk(category.id)).unwrap();
      notify("success", "Categoría eliminada");
      await loadCategories();
    } catch (err) {
      console.error(err)
      // Posible caso: categoría en uso por productos
      notify("error", err.message || "No se pudo eliminar la categoría (puede estar en uso)");
    } finally {
      setLoading(false);
    }
  };

  // crea una nueva categoría
  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    const trimmedDescription = categoryForm.description.trim();
    if(!trimmedDescription){
      notify("error", "La categoría necesita una descripción")
      return;
    }
    setLoading(true);

    try{
      await dispatch(
        createCategoryThunk({description: trimmedDescription})
      ).unwrap();
      notify("success", "Categoría creada correctamente");
      setCategoryForm(EMPTY_CATEGORY);
      await loadCategories();
    } catch(error){
      console.error(error);
      notify("error", error || 'No se pudo crear la categoría')
    } finally{
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

    setLoading(true);
    try {
      await dispatch(createCouponThunk({
        code: trimmedCode,
        discount: discountValue,
        expirationDate: couponForm.expirationDate,
      })).unwrap();
      notify("success", "Cupón creado correctamente");
      resetCouponForm();
      await loadCoupons();
    } catch (error) {
      console.error(error);
      notify("error", error || "No se pudo crear el cupón");
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
      await dispatch(deleteCouponThunk(couponId)).unwrap();
      notify("success", "Cupón eliminado correctamente");
      await loadCoupons();
    } catch (error) {
      console.error(error);
      notify("error", error || "No se pudo eliminar el cupón");
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

      <StatusAlert status={status} />

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