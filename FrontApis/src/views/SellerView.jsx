import { createRef, useEffect, useMemo, useState } from "react";
import { createProduct, getCategories, getProducts } from "../services/adminService";
import ProductForm from "../components/Panels/ProductForm";
import StatusAlert from "../components/Panels/StatusAlert";
import { EMPTY_PRODUCT } from "../constants/product";
import ProductList from "../components/Panels/ProductList";
import { getCurrentUser } from "../services/authService";

function SellerView() {
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

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
        notify(
          "error",
          "No se pudo identificar al usuario actual para listar sus productos"
        );
        setSellerProducts([]);
        return;
      }

      const filteredProducts = parsedProducts.filter((product) => {
        const creatorId =
          product?.creator_id ?? product?.creatorId ?? product?.creatorID;
        if (creatorId === undefined || creatorId === null) {
          return false;
        }
        return String(creatorId) === String(currentUserId);
      });

      setSellerProducts(filteredProducts);
    } catch (error) {
      console.error(error);
      notify(
        "error",
        error.message || "No se pudieron cargar los productos del vendedor"
      );
      setSellerProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSellerProducts();

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

      const categoryValue = Number.parseInt(productForm.categoryId, 10);
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
        categoryId: categoryValue,
        base64img: productForm.base64img || null,
        creator_id: (await getCurrentUser())?.id || null,
      };

      await createProduct(payload);
      console.log("Producto creado:", payload);
      notify("success", "Producto cargado correctamente");
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

  const handleRefresh = () => {
    if (isLoadingCategories || isSubmitting || isLoadingProducts) {
      return;
    }
    fetchCategories();
    fetchSellerProducts();
  };

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
          onClick={handleRefresh}
          disabled={
            isLoadingCategories || isSubmitting || isLoadingProducts
          }
        >
          Actualizar datos
        </button>
      </header>

      <StatusAlert status={status} />

      {isLoadingCategories && categories.length === 0 && (
        <div className="admin-loading">Cargando categorías...</div>
      )}

      <section className="admin-section">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Cargar producto</h2>
            <span>{categories.length} categorías disponibles</span>
          </div>
          <ProductForm
            title="Datos del producto"
            product={productForm}
            categories={categories}
            onChange={handleProductChange}
            onSubmit={handleProductSubmit}
            submitLabel={isSubmitting ? "Cargando..." : "Cargar producto"}
            isSubmitting={isSubmitting}
            isSubmitDisabled={isSubmitDisabled}
            onCancel={resetProductForm}
            cancelLabel="Limpiar formulario"
          />
        </div>
      </section>

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
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default SellerView;