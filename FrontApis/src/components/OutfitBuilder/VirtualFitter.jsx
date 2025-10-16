import { useEffect, useMemo, useState, useCallback } from "react";
import "./VirtualFitter.css";

const BASE_URL = import.meta.env.VITE_API_URL;


/* TIRA ERROR POR LAS CATEGORIAS, ESTO SE HACE AL FINAL, CUANDO TERMINEMOS CON EL COSO */


/**
 * CATEGORIES define el mapeo de las tres secciones del probador top, bottom, coat
 * con la lista de nombres de categoría que aparecen 
 *  Remera, Hoodie cuentan como prendas superiores
 *  "Pantalon", "Short", "Jean" se consideran prendas inferiores
 *  "Abrigo" se usa para la capa de abrigo.
 * si se agregan nuevas categorias, agregarlas al array
 */
const CATEGORIES = [
  { key: "top", label: "Prenda superior", apiValues: ["Remera", "Hoodie"] },
  { key: "bottom", label: "Prenda inferior", apiValues: ["Pantalon", "Short", "Jean"] },
  { key: "coat", label: "Abrigo", apiValues: ["Abrigo"] },
];

// Adaptador por si la API trae otros campos
function mapProduct(p) {
  return {
    id: p.id ?? p.productId ?? p.code,
    name: p.name ?? p.title ?? "Producto",
    image: p.image ?? p.imageUrl ?? p.thumbnail,    //que sea un PNG con fondo transparente
    category: p.category ?? p.type ?? "",
  };
}

export default function VirtualFitter() {
  const [itemsByCat, setItemsByCat] = useState({
    top: [],
    bottom: [],
    coat: [],
  });
  const [indexes, setIndexes] = useState({
    top: 0,
    bottom: 0,
    coat: 0,
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Carga todas las categorías en paralelo
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");

    //Devuelve un array de productos para una lista de nombres de categoría
    const fetchByCat = async (apiValues) => {
      try {
        //Hace peticiones en paralelo para cada nombre de categoría
        const lists = await Promise.all(apiValues.map(async (apiValue) => {
          const res = await fetch(`${BASE_URL}/products/category/${encodeURIComponent(apiValue)}`);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status} al cargar ${apiValue}`);
          }
          const data = await res.json();
          //Convierte cada producto a la estructura esperada y filtra los que no tengan imagen
          return (Array.isArray(data) ? data : []).map(mapProduct).filter((p) => !!p.image);
        }));
        //Concatena los resultados de todas las categorías en un único arreglo
        return lists.flat();
      } catch (e) {
        //Propaga el error al nivel superior
        throw e;
      }
    };

    //Carga cada grupo (top, bottom, coat) y su lista de productos
    Promise.all(
      CATEGORIES.map((c) =>
        fetchByCat(c.apiValues).then((list) => ({
          key: c.key,
          list,
        }))
      )
    )
      .then((results) => {
        if (!mounted) return;
        const next = { top: [], bottom: [], coat: [] };
        results.forEach(({ key, list }) => {
          next[key] = list;
        });
        setItemsByCat(next);
        //Reinicia índices. Si la lista está vacía, se mantiene en 0.
        setIndexes({
          top: Math.min(0, next.top.length - 1),
          bottom: Math.min(0, next.bottom.length - 1),
          coat: Math.min(0, next.coat.length - 1),
        });
      })
      .catch((e) => {
        if (!mounted) return;
        setErr(e.message || "Error al cargar productos");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [BASE_URL]);

  const currentTop = useMemo(
    () => itemsByCat.top[indexes.top] || null,
    [itemsByCat.top, indexes.top]
  );
  const currentBottom = useMemo(
    () => itemsByCat.bottom[indexes.bottom] || null,
    [itemsByCat.bottom, indexes.bottom]
  );
  const currentCoat = useMemo(
    () => itemsByCat.coat[indexes.coat] || null,
    [itemsByCat.coat, indexes.coat]
  );

  const cycle = useCallback(
    (key, dir = 1) => {
      setIndexes((prev) => {
        const list = itemsByCat[key] || [];
        if (list.length === 0) return prev;
        const len = list.length;
        const nextIndex = ((prev[key] ?? 0) + dir + len) % len;
        return { ...prev, [key]: nextIndex };
      });
    },
    [itemsByCat]
  );

  if (loading) {
    return (
      <div className="vf-wrapper">
        <div className="vf-stage">
          <div className="vf-loading">Cargando prendas…</div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="vf-wrapper">
        <div className="vf-stage">
          <div className="vf-error">
            {err}
            <div className="vf-hint">
              Verifica VITE_API_URL y que los endpoints /products/category/{'{nombre}'} existan.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vf-page">
      <div className="vf-shell container">
        <header className="vf-header">
          <h2 className="vf-title">Probador virtual</h2>
          <p className="vf-subtitle">
            Usa las flechas para combinar prenda superior, prenda inferior y abrigo
          </p>
        </header>

        <div className="vf-grid">
          {/* CONTROLES */}
          <aside className="vf-controls vf-card">
            {CATEGORIES.map((cat) => {
              const list = itemsByCat[cat.key] || [];
              const has = list.length > 0;
              const current = has ? list[indexes[cat.key] % list.length] : null;

              return (
                <div key={cat.key} className="vf-control-row">
                  <div className="vf-control-label">{cat.label}</div>

                  <div className="vf-arrows">
                    <button
                      className="vf-arrow"
                      onClick={() => cycle(cat.key, -1)}
                      disabled={!has}
                      aria-label={`Anterior ${cat.label}`}
                    >
                      ◀
                    </button>

                    <div
                      className="vf-current-name"
                      title={current?.name || "Sin productos"}
                    >
                      {current?.name || "Sin productos"}
                    </div>

                    <button
                      className="vf-arrow"
                      onClick={() => cycle(cat.key, 1)}
                      disabled={!has}
                      aria-label={`Siguiente ${cat.label}`}
                    >
                      ▶
                    </button>
                  </div>

                  <div className="vf-mini">
                    {has ? (
                      <img src={current.image} alt={current.name} />
                    ) : (
                      <div className="vf-mini-empty">—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </aside>

          {/* ESCENARIO */}
          <section className="vf-stage vf-card">
            <img
              className="vf-mannequin"
              src="src/assets/mannequin.png"
              alt="Maniquí"
            />

            {currentBottom && (
              <img
                className="vf-layer vf-layer-bottom"
                src={currentBottom.image}
                alt={currentBottom.name}
              />
            )}
            {currentTop && (
              <img
                className="vf-layer vf-layer-top"
                src={currentTop.image}
                alt={currentTop.name}
              />
            )}
            {currentCoat && (
              <img
                className="vf-layer vf-layer-coat"
                src={currentCoat.image}
                alt={currentCoat.name}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
