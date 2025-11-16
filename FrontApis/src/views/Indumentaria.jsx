import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Products from "../components/Products";
import { fetchCategories } from "../redux/categoriesSlice";

export default function IndumentariaPage() {
  const [sel, setSel] = useState("all");
  const dispatch = useDispatch();

  const { categories: cats, loading, error } = useSelector(
    (state) => state.categories
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <main className="indumentaria-page">

      {/* Barra de categorías */}
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
      </div>

      <Products categoryId={sel === "all" ? null : sel} />
    </main>
  );
}
