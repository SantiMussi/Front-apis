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

const BASE_URL = import.meta.env.VITE_API_URL;

const SellerView = () => {
  const [productForm, setProductForm] = useState({ ...EMPTY_PRODUCT });
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);


  // Notificación temporal
  const notify = (type, message) => {
    setStatus({ type, message });
    window.clearTimeout(notify.timeoutId);
    notify.timeoutId = window.setTimeout(() => setStatus(null), 5000);
  };

  // Reset form
  const resetProductForm = () => {
    setProductForm({ ...EMPTY_PRODUCT });
    setSelectedProductId(null);
  };

  // Categorías
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

  // Productos del vendedor
  const fetchSellerProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const [currentUser, productsResponse] = await Promise.all([
        getCurrentUser(),
        getProducts(),
      ]);

      const parsedProducts = Array.isArray(productsResponse)
        ? productsResponse
        : productsResponse?.content || [];

      const currentUserId = currentUser?.id;
      if (!currentUserId) {
        notify("error", "No se pudo identificar al usuario actual para listar sus productos");
        setSellerProducts([]);
        return;
      }

      const filtered = parsedProducts.filter((p) => {
        const creatorId = p?.creatorId;
        return creatorId !== undefined && creatorId !== null && String(creatorId) === String(currentUserId);
      });

      setSellerProducts(filtered);
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudieron cargar los productos del vendedor");
      setSellerProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };


  // Carga inicial
  useEffect(() => {
    fetchCategories();
    fetchSellerProducts();
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
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const trimmedName = productForm.name.trim();
      if (!trimmedName) return notify("error", "El nombre del producto es obligatorio");

      const priceValue = Number.parseFloat(productForm.price);
      if (Number.isNaN(priceValue)) return notify("error", "Ingresá un precio válido");

      const discountValue = productForm.discount === "" ? 0 : Number.parseFloat(productForm.discount);
      if (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 1)
        return notify("error", "El descuento debe estar entre 0 y 1");

      const stockValue = productForm.stock === "" ? 0 : Number.parseInt(productForm.stock, 10);
      if (Number.isNaN(stockValue) || stockValue < 0) return notify("error", "El stock no es válido");

      const categoryValue = Number.parseInt(productForm.categoryId, 10);
      if (Number.isNaN(categoryValue)) return notify("error", "Seleccioná una categoría válida");

      const currentUser = await getCurrentUser();
      if (!currentUser?.id) return notify("error", "No se pudo identificar al usuario actual");

      const payload = {
        name: trimmedName,
        description: productForm.description,
        price: priceValue,
        discount: discountValue,
        size: productForm.size ? productForm.size.toUpperCase() : null,
        stock: stockValue,
        categoryId: categoryValue,
        base64img: productForm.base64img || null,
        creatorId: currentUser.id,
      };

      if (selectedProductId) {
        await updateProduct(selectedProductId, payload);
        notify("success", "Producto actualizado correctamente");
      } else {
        await createProduct(payload);
        notify("success", "Producto cargado correctamente");
      }
      await fetchSellerProducts();
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
      !productForm.categoryId,
    [isSubmitting, isLoadingCategories, productForm]
  );

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
  };

  const handleDeleteProduct = async (id) => {
    if (!id || isSubmitting) return;
    const confirmed = window.confirm("¿Eliminar este producto?");
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await deleteProduct(id);
      notify("success", "Producto eliminado correctamente");
      await fetchSellerProducts();
      if (selectedProductId === id) resetProductForm();
    } catch (error) {
      console.error(error);
      notify("error", error.message || "No se pudo eliminar el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refrescar todo
  const handleRefresh = () => {
    if (isLoadingCategories || isSubmitting || isLoadingProducts) return;
    fetchCategories();
    fetchSellerProducts();
  };

  const isEditing = Boolean(selectedProductId);

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Panel de Vendedor</h1>
          <p className="admin-subtitle">Cargá nuevos productos para que aparezcan en la tienda.</p>
        </div>
        <button
          type="button"
          className="admin-refresh"
          onClick={handleRefresh}
          disabled={isLoadingCategories || isSubmitting || isLoadingProducts}
        >
          Actualizar datos
        </button>
      </header>

      <StatusAlert status={status} />

      {isLoadingCategories && categories.length === 0 && (
        <div className="admin-loading">Cargando categorías...</div>
      )}

      {/* Formulario de producto */}
      <section className="admin-section">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Cargar producto</h2>
            <span>{categories.length} categorías disponibles</span>
          </div>
          <ProductForm
            title={isEditing ? "Editar producto" : "Datos del producto"}
            product={productForm}
            categories={categories}
            onChange={handleProductChange}
            onSubmit={handleProductSubmit}
            submitLabel={
              isSubmitting ? "Cargando..." : isEditing ? "Actualizar producto" : "Cargar producto"
            }
            isSubmitting={isSubmitting}
            isSubmitDisabled={isSubmitDisabled}
            onCancel={resetProductForm}
            cancelLabel={isEditing ? "Cancelar edición" : "Limpiar formulario"}
          />
        </div>
      </section>

      {/* Lista de productos */}
      <section className="admin-section">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Mis productos publicados</h2>
            <span>{sellerProducts.length} productos encontrados</span>
          </div>
          {isLoadingProducts ? (
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
      </section>
    </div>
  );
};

export default SellerView;
