import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Products from "../components/Products";
import { fetchCategories } from "../redux/categoriesSlice";

export default function IndumentariaPage() {
  const [sel, setSel] = useState("all");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const dispatch = useDispatch();

  const { categories: cats, loading, error } = useSelector(
    (state) => state.categories
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const clearFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <main className="indumentaria-page">
      <div className="cat-bar">
        {loading && (
          <div className="cat-loading">
            <span>Cargando categorías...</span>
          </div>
        )}

        {!loading && !error && (
          <>
            <button
              className={`cat-pill ${sel === "all" ? "active" : ""}`}
              onClick={() => setSel("all")}
            >
              Todas
            </button>

            {cats.map((c) => (
              <button
                key={c.id}
                className={`cat-pill ${sel === c.id ? "active" : ""}`}
                onClick={() => setSel(c.id)}
              >
                {c.label}
              </button>
            ))}
          </>
        )}

        {error && (
          <span className="error-cats">Error al cargar categorías</span>
        )}

        {/* 🔍 Buscador por nombre */}
        <div className="cat-search">
          <input
            type="text"
            className="cat-search-input"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filtro por precio */}
        <div className="price-filter">
          <input
            type="number"
            className="price-input"
            placeholder="Min $"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className="price-separator">–</span>
          <input
            type="number"
            className="price-input"
            placeholder="Max $"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        {(search || minPrice || maxPrice) && (
          <button
            type="button"
            className="admin-button"
            style={{ marginLeft: "0.5rem" }}
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <Products
        categoryId={sel === "all" ? null : sel}
        query={search}
        minPrice={minPrice}
        maxPrice={maxPrice}
      />
    </main>
  );
}
