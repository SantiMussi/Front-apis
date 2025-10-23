import { useEffect, useMemo, useState } from "react";
import {
  createProduct,
  getCategories,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../services/adminService";
import ProductForm from "../components/Panels/ProductForm";
import StatusAlert from "../components/Panels/StatusAlert";
import { EMPTY_PRODUCT } from "../constants/product";
import ProductList from "../components/Panels/ProductList";
import { getCurrentUser } from "../services/authService";
import Collapsible from "../components/Collapsible/Collapsible";

const EMPTY_STATUS = null;

/** Mantengo BASE_URL si lo usás en otros helpers de este archivo */
const BASE_URL = import.meta.env.VITE_API_URL;

export default function SellerView() {
  const [productForm, setProductForm] = useState({ ...EMPTY_PRODUCT });
  const [selectedProductId, setSelectedProductId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);

  const [status, setStatus] = useState(EMPTY_STATUS);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Acordeón (igual que en THEGODPAGE)
  const [openPanel, setOpenPanel] = useState("");
  const togglePanel = (id) => setOpenPanel((curr) => (curr === id ? null : id));

  // Notificación temporal (idéntico a THEGODPAGE)
  const notify = (type, message) => {
    setStatus({ type, message });
    window.clearTimeout(notify.timeoutId);
    notify.timeoutId = window.setTimeout(() => setStatus(null), 5000);
  };

  // Reset formulario
  const resetProductForm = () => {
    setProductForm({ ...EMPTY_PRODUCT });
    setSelectedProductId(null);
  };

  // CATEGORÍAS
  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : data?.content || []);
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudieron cargar las categorías");
      setCategories([]);
    }
  };

  // PRODUCTOS DEL VENDEDOR
  const fetchSellerProducts = async () => {
    try {
      const [currentUser, productsResponse] = await Promise.all([
        getCurrentUser(),
        getProducts(),
      ]);

      const parsed = Array.isArray(productsResponse)
        ? productsResponse
        : productsResponse?.content || [];

      const currentUserId = currentUser?.id;
      if (!currentUserId) {
        notify("error", "No se pudo identificar al usuario actual para listar sus productos");
        setSellerProducts([]);
        return;
      }

      // Acepta tanto creatorId como creator_id desde el backend
      const filtered = parsed.filter((p) => {
        const creator =
          p?.creatorId ?? p?.creator_id ?? p?.creator?.id ?? null;
        return creator !== undefined && creator !== null && String(creator) === String(currentUserId);
      });

      setSellerProducts(filtered);
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudieron cargar los productos del vendedor");
      setSellerProducts([]);
    }
  };

  // Bootstrap inicial (igual patrón que THEGODPAGE)
  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchSellerProducts()]);
      setLoading(false);
      setInitialLoad(false);
    };
    bootstrap();

    return () => {
      if (notify.timeoutId) window.clearTimeout(notify.timeoutId);
    };
  }, []);

  // Form product
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
        productForm.discount === "" ? 0 : Number.parseFloat(productForm.discount);
      if (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 1) {
        notify("error", "El descuento debe estar entre 0 y 1");
        setLoading(false);
        return;
      }

      const stockValue =
        productForm.stock === "" ? 0 : Number.parseInt(productForm.stock, 10);
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
        notify("error", "No se pudo identificar al usuario actual");
        setLoading(false);
        return;
      }

      // Payload alineado con THEGODPAGE (creator_id)
      const payload = {
        name: trimmedName,
        description: productForm.description,
        price: priceValue,
        discount: discountValue,
        size: productForm.size ? productForm.size.toUpperCase() : null,
        stock: stockValue,
        categoryId: categoryValue,
        base64img: productForm.base64img || null,
        creator_id: currentUser.id, // <- clave
      };

      if (selectedProductId) {
        await updateProduct(selectedProductId, payload);
        notify("success", "Producto actualizado correctamente");
      } else {
        await createProduct(payload);
        notify("success", "Producto creado correctamente");
      }

      await fetchSellerProducts();
      resetProductForm();
    } catch (error) {
      console.error(error);
      notify("error", error.message || "Ocurrió un error al cargar el producto");
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading; // usamos el mismo flag general que en THEGODPAGE

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
    // abre el panel de productos al editar (calza con UX del admin)
    setOpenPanel("products");
  };

  // Eliminar
  const handleDeleteProduct = async (id) => {
    if (!id) return;
    const confirmed = window.confirm("¿Eliminar este producto?");
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteProduct(id);
      notify("success", "Producto eliminado correctamente");
      await fetchSellerProducts();
      if (selectedProductId === id) resetProductForm();
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudo eliminar el producto");
    } finally {
      setLoading(false);
    }
  };

  // Refresh todo
  const handleRefresh = () => {
    setLoading(true);
    Promise.all([fetchCategories(), fetchSellerProducts()])
      .catch(() => null)
      .finally(() => setLoading(false));
  };

  const isEditing = Boolean(selectedProductId);

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Panel de Vendedor</h1>
          <p className="admin-subtitle">Cargá y administrá tus productos publicados.</p>
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

      <StatusAlert status={status} />

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
            {loading && !sellerProducts.length ? (
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
