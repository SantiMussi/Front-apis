import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  fetchProducts as fetchProductsThunk,
  createProduct as createProductThunk,
  updateProduct as updateProductThunk,
  deleteProduct as deleteProductThunk,
} from "../redux/productsSlice";
import { fetchCategories as fetchCategoriesThunk } from "../redux/categoriesSlice";

import { getCurrentUser } from "../services/authService";
import ProductForm from "../components/Panels/ProductForm";
import ProductList from "../components/Panels/ProductList";
import StatusAlert from "../components/Panels/StatusAlert";
import Collapsible from "../components/Collapsible/Collapsible";
import { EMPTY_PRODUCT } from "../constants/product";

const EMPTY_STATUS = null;

export default function SellerView() {
  const dispatch = useDispatch();

  // Redux
  const { products, loading: prodLoading } = useSelector(
    (state) => state.products
  );
  const { categories, loading: catLoading, error: catError } = useSelector(
    (state) => state.categories
  );

  //ID del user logged
  const [currentUserId, setCurrentUserId] = useState(null);

  //Form de prod
  const [productForm, setProductForm] = useState({ ...EMPTY_PRODUCT });
  const [selectedProductId, setSelectedProductId] = useState(null);

  //UI
  const [status, setStatus] = useState(EMPTY_STATUS);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  //Acordeón
  const [openPanel, setOpenPanel] = useState("products");
  const togglePanel = (id) => setOpenPanel((curr) => (curr === id ? null : id));

  //Notif
  const notify = (type, message) => {
    setStatus({ type, message });
    window.clearTimeout(notify.timeoutId);
    notify.timeoutId = window.setTimeout(() => setStatus(null), 5000);
  };

  const resetProductForm = () => {
    setProductForm({ ...EMPTY_PRODUCT });
    setSelectedProductId(null);
  };

  //Cargar usuario actual
  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      if (!user?.id) {
        notify("error", "No se pudo identificar al usuario actual");
        setCurrentUserId(null);
        return;
      }
      setCurrentUserId(user.id);
    } catch (error) {
      console.error(error);
      notify(
        "error",
        error.message || "No se pudo obtener el usuario actual"
      );
      setCurrentUserId(null);
    }
  };

  // Bootstrap: productos + categorías + usuario
  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      await Promise.all([
        dispatch(fetchCategoriesThunk()),
        dispatch(fetchProductsThunk()),
        loadCurrentUser(),
      ]);
      setLoading(false);
      setInitialLoad(false);
    };

    bootstrap();

    return () => {
      if (notify.timeoutId) window.clearTimeout(notify.timeoutId);
    };
  }, [dispatch]);

  // Productos del vendedor filtredos
  const sellerProducts = useMemo(() => {
    if (!currentUserId) return [];
    return products.filter((p) => {
      const creator =
        p?.creatorId ?? p?.creator_id ?? p?.creator?.id ?? null;
      if (creator == null) return false;
      return String(creator) === String(currentUserId);
    });
  }, [products, currentUserId]);

  // Manejo del form de producto
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const trimmedName = (productForm.name || "").trim();
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

      if (!currentUserId) {
        notify(
          "error",
          "No se pudo identificar al usuario actual para asignar el producto"
        );
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
        creator_id: currentUserId,
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
        //refresco productos globales, sellerProducts se recalcula solo
        await dispatch(fetchProductsThunk());
        resetProductForm();
      } else {
        const errorMessage =
          resultAction.error?.message ||
          "Ocurrió un error al cargar el producto";
        notify("error", errorMessage);
      }
    } catch (error) {
      console.error(error);
      notify(
        "error",
        error.message || "Ocurrió un error al cargar el producto"
      );
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading;

  const isSubmitDisabled = useMemo(
    () =>
      isSubmitting ||
      !productForm.name?.trim() ||
      !productForm.price ||
      !productForm.stock ||
      !productForm.size ||
      !productForm.categoryId,
    [isSubmitting, productForm]
  );

  // Editar
  const handleEditProduct = (formValues, productId) => {
    setSelectedProductId(productId ?? null);

    const normalizedCategoryValue =
      formValues.categoryId === undefined || formValues.categoryId === null
        ? ""
        : String(formValues.categoryId);

    const normalizedForm = {
      ...formValues,
      price: formValues.price ?? "",
      discount: formValues.discount ?? "",
      stock: formValues.stock ?? "",
      categoryId: normalizedCategoryValue,
      category_id: normalizedCategoryValue,
      base64img: formValues.base64img || "",
      image_preview_url: formValues.base64img || null,
    };

    setProductForm({ ...EMPTY_PRODUCT, ...normalizedForm });
    setOpenPanel("products");
  };

  // Eliminar
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
        notify("success", "Producto eliminado correctamente");
        await dispatch(fetchProductsThunk()); //Refetch
        if (selectedProductId === id) resetProductForm();
      } else {
        const errorMessage =
          actionResult.error?.message ||
          "No se pudo eliminar el producto";
        notify("error", errorMessage);
      }
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudo eliminar el producto");
    } finally {
      setLoading(false);
    }
  };

  // Refresh manual
  const handleRefresh = () => {
    setLoading(true);
    Promise.all([
      dispatch(fetchCategoriesThunk()),
      dispatch(fetchProductsThunk()),
      loadCurrentUser(),
    ])
      .catch(() => null)
      .finally(() => setLoading(false));
  };

  const isEditing = Boolean(selectedProductId);

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Panel de Vendedor</h1>
          <p className="admin-subtitle">
            Cargá y administrá tus productos publicados.
          </p>
        </div>
        <button
          type="button"
          className="admin-refresh"
          onClick={handleRefresh}
          disabled={loading}
        >
          Refrescar
        </button>
      </header>

      <StatusAlert status={status} onClose={() => setStatus(null)} />

      {loading && initialLoad && (
        <div className="admin-loading">Cargando información...</div>
      )}

      <section className="admin-section full-width">
        <Collapsible
          id="products"
          title="Mis productos"
          rightInfo={`${sellerProducts.length} publicados`}
          isOpen={openPanel === "products"}
          onToggle={togglePanel}
          className="split"
          contentClassName="split"
        >
          {/* Lista */}
          <div className="admin-card-block">
            {(loading || prodLoading) && !sellerProducts.length ? (
              <div className="admin-loading">Cargando productos...</div>
            ) : (
              <ProductList
                products={sellerProducts}
                categories={categories}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            )}
          </div>

          {/* Formulario */}
          <div className="admin-card-block">
            <ProductForm
              title={isEditing ? "Editar producto" : "Crear producto"}
              product={productForm}
              categories={categories}
              onChange={handleProductChange}
              onSubmit={handleProductSubmit}
              onCancel={isEditing ? resetProductForm : undefined}
              submitLabel={isEditing ? "Actualizar" : "Crear"}
              isSubmitting={isSubmitting}
              isSubmitDisabled={isSubmitDisabled}
            />
          </div>
        </Collapsible>
      </section>
    </div>
  );
}
