import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef
} from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/productsSlice";
import { addToCart } from "../../redux/cartSlice"
import mannequin from "../../assets/mannequin.png";
import { hasRole, GetToken } from "../../services/authService";
import "./VirtualFitter.css";

/** Calibración por capa (defaults) */
const LAYER_DEFAULTS = {
  top: { scale: 0.17, x: 1.2, y: -3.5, z: 30 },
  bottom: { scale: 0.40, x: 0.8, y: 17.5, z: 20 },
  coat: { scale: 0.24, x: 1.0, y: -4.5, z: 40 },
};

/** Mapeo de categorías lógicas */
const CATEGORIES = [
  { key: "top", label: "Prenda superior", apiValues: ["Remera"] },
  { key: "bottom", label: "Prenda inferior", apiValues: ["Pantalon", "Short", "Jean"] },
  { key: "coat", label: "Abrigo", apiValues: ["Abrigo", "Polar", "Hoodie"] },
];



/** Normaliza producto del backend */
function mapProduct(p) {
  const b64 = p.base64img ?? p.imgBase64 ?? null;
  const image = typeof b64 === "string" && b64.length
    ? (b64.startsWith("data:") ? b64 : `data:image/png;base64,${b64}`)
    : (p.image ?? p.imageUrl ?? p.thumbnail ?? null);

  return {
    id: p.id ?? p.productId ?? p.code,
    name: p.name ?? p.title ?? "Producto",
    image,
    categoryName: p.category?.name ?? p.categoryName ?? p.category ?? "",
    price: p.price ?? 0,
  };
}

/** Agrupa productos por capa lógica (top/bottom/coat) */
function bucketizeProducts(all) {
  const out = { top: [], bottom: [], coat: [] };

  const isIn = (name, list) =>
    list.some((x) => x.toLowerCase() === String(name).toLowerCase());

  const tops = CATEGORIES.find(c => c.key === "top").apiValues;
  const bottoms = CATEGORIES.find(c => c.key === "bottom").apiValues;
  const coats = CATEGORIES.find(c => c.key === "coat").apiValues;

  for (const raw of all) {
    const p = mapProduct(raw);
    if (!p.image) continue;

    if (isIn(p.categoryName, tops)) out.top.push(p);
    if (isIn(p.categoryName, bottoms)) out.bottom.push(p);
    if (isIn(p.categoryName, coats)) out.coat.push(p);
  }
  return out;
}

export default function VirtualFitter() {

  const dispatch = useDispatch();

  // productos desde Redux
  const {
    products = [],
    loading,
    error
  } = useSelector((state) => state.products);

  // estado local
  const [indexes, setIndexes] = useState({ top: -1, bottom: -1, coat: -1 }); // -1 = ninguna
  const [searchParams] = useSearchParams();
  const preselectId = searchParams.get("productId");
  const appliedPreselectIdRef = useRef(null);

  const [cal, setCal] = useState(LAYER_DEFAULTS);
  const [overrides, setOverrides] = useState({});
  const [editKey, setEditKey] = useState("top");

  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState("");

  // derivamos itemsByCat de products (no se guarda más en state)
  const itemsByCat = useMemo(
    () => bucketizeProducts(products),
    [products]
  );

  // si no hay productos cargados, disparo fetchProducts al montar
  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]); // products.length para no re-fetch infinito

  // preselección por ?productId (igual que antes, pero usando itemsByCat de arriba)
  useEffect(() => {
    if (!preselectId) return;
    if (appliedPreselectIdRef.current === preselectId) return;

    const updates = {};
    let firstKey = null;

    Object.entries(itemsByCat).forEach(([key, list]) => {
      const idx = list.findIndex((item) => String(item.id) === preselectId);
      if (idx !== -1) {
        updates[key] = idx;
        if (!firstKey) firstKey = key;
      }
    });

    if (Object.keys(updates).length === 0) return;

    setIndexes((prev) => ({ ...prev, ...updates }));
    if (firstKey) setEditKey(firstKey);
    appliedPreselectIdRef.current = preselectId;
  }, [preselectId, itemsByCat]);

  const currentTop = useMemo(
    () => (indexes.top >= 0 ? itemsByCat.top[indexes.top] : null),
    [itemsByCat, indexes.top]
  );
  const currentBottom = useMemo(
    () => (indexes.bottom >= 0 ? itemsByCat.bottom[indexes.bottom] : null),
    [itemsByCat, indexes.bottom]
  );
  const currentCoat = useMemo(
    () => (indexes.coat >= 0 ? itemsByCat.coat[indexes.coat] : null),
    [itemsByCat, indexes.coat]
  );

  const selectedProducts = useMemo(
    () => [currentTop, currentBottom, currentCoat].filter(Boolean),
    [currentTop, currentBottom, currentCoat]
  );

  // ciclo que incluye ninguna (-1)
  const cycle = useCallback(
    (key, dir = 1) => {
      setIndexes((prev) => {
        const list = itemsByCat[key] || [];
        const len = list.length;
        const order = [-1, ...Array.from({ length: len }, (_, i) => i)];
        const cur = prev[key] ?? -1;
        const idx = Math.max(0, order.indexOf(cur));
        const next = order[(idx + dir + order.length) % order.length];
        return { ...prev, [key]: next };
      });
    },
    [itemsByCat]
  );


  // mueve la prenda activa (guarda override por producto)
  const nudge = (key, dx, dy) => {
    const cur = { top: currentTop, bottom: currentBottom, coat: currentCoat }[key];
    if (!cur) return;
    const base = cal[key];
    const prev = overrides[cur.id] || {};
    const next = {
      x: (prev.x ?? base.x) + dx,
      y: (prev.y ?? base.y) + dy,
      scale: prev.scale ?? base.scale,
    };
    const updated = { ...overrides, [cur.id]: next };
    setOverrides(updated);
  };

  // ESCALA
  const tweakScale = (key, delta) => {
    const cur = { top: currentTop, bottom: currentBottom, coat: currentCoat }[key];
    if (!cur) return;
    const base = cal[key];
    const prev = overrides[cur.id] || {};
    const currentScale = prev.scale ?? base.scale;
    const nextScale = Math.min(1.5, Math.max(0.05, currentScale + delta));
    const next = { x: (prev.x ?? base.x), y: (prev.y ?? base.y), scale: nextScale };
    const updated = { ...overrides, [cur.id]: next };
    setOverrides(updated);
  };

  const setScaleAbs = (key, value) => {
    const cur = { top: currentTop, bottom: currentBottom, coat: currentCoat }[key];
    if (!cur) return;
    const base = cal[key];
    const prev = overrides[cur.id] || {};
    const clamped = Math.min(1.5, Math.max(0.05, value));
    const next = { x: (prev.x ?? base.x), y: (prev.y ?? base.y), scale: clamped };
    const updated = { ...overrides, [cur.id]: next };
    setOverrides(updated);
  };

  // atajos de teclado (mover + escalar)
  useEffect(() => {
    const onKey = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 1 : 0.5;
        nudge(
          editKey,
          (e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0),
          (e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0)
        );
        return;
      }
      if (e.key === "+" || e.key === "=") { e.preventDefault(); tweakScale(editKey, e.shiftKey ? 0.02 : 0.01); }
      if (e.key === "-") { e.preventDefault(); tweakScale(editKey, e.shiftKey ? -0.02 : -0.01); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editKey, currentTop, currentBottom, currentCoat, overrides, cal]);

  // estilo final = base por capa + override por producto (si existe)
  function styleFor(layerKey, prod) {
    const base = cal[layerKey];
    const ov = prod ? overrides[prod.id] : null;
    const x = ov?.x ?? base.x;
    const y = ov?.y ?? base.y;
    const scale = ov?.scale ?? base.scale;
    return {
      transform: `translate(-50%, -50%) translate(${x}%, ${y}%) scale(${scale})`,
      zIndex: base.z,
    };
  }

  // reset total
  const onResetOriginal = () => {
    setIndexes({ top: -1, bottom: -1, coat: -1 });
    setCal(LAYER_DEFAULTS);
    setOverrides({});
  };

  // estado derivado para UI de escala de la capa activa
  const activeProd = editKey === "top" ? currentTop : editKey === "bottom" ? currentBottom : currentCoat;
  const activeBase = cal[editKey];
  const activeOv = activeProd ? overrides[activeProd.id] : null;
  const activeScale = activeOv?.scale ?? activeBase.scale;

  // helpers UI (press & hold + slider fill)
  const holdRef = useRef({ t: null, f: null });

  function startHold(e, fn) {
    if (!activeProd) return;
    fn(); // primer tick inmediato
    holdRef.current.f = fn;
    holdRef.current.t = setInterval(() => {
      holdRef.current?.f && holdRef.current.f();
    }, e.shiftKey ? 35 : 60); // acelerado con Shift
  }
  function stopHold() {
    if (holdRef.current.t) clearInterval(holdRef.current.t);
    holdRef.current.t = null;
    holdRef.current.f = null;
  }

  function updateRangeFill(el) {
    const min = parseFloat(el.min), max = parseFloat(el.max), val = parseFloat(el.value);
    const pct = ((val - min) / (max - min)) * 100;
    el.style.setProperty('--fill', `${pct}%`);
    const bubble = el.parentElement?.querySelector('.vf-bubble');
    if (bubble) bubble.style.setProperty('--x', `${pct}%`);
  }

  useEffect(() => {
    const input = document.querySelector('.vf-range.pro');
    if (input) updateRangeFill(input);
  }, [activeScale, activeProd]);

  //  agregar outfit al carrito
  async function addOutfitToCart() {
    setAddMsg("");

    if (selectedProducts.length === 0) {
      setAddMsg("Elegí al menos 1 prenda para agregar al carrito");
      return;
    }

    selectedProducts.forEach((p) => {
      dispatch(
        addToCart({
          id: p.id,
          name: p.name,
          price: p.price ?? 0,
          size: '',
          quantity: 1,
          base64img: p.image,
        })
      )
    })

    setAddMsg('Outfit agregado al carrito')
  }

  if (loading) return <div className="vf-loading">Cargando prendas…</div>;
  if (error) return <div className="vf-error">Error: {error}</div>;


  return (
    <div className="vf-page">
      <div className="vf-shell container">
        <header className="vf-header">
          <h2 className="vf-title">Probador virtual</h2>
          <p className="vf-subtitle">Usá las flechas para combinar superior, inferior y abrigo</p>

          <div className="vf-toolbar">
            <label className="vf-label">Editar capa</label>
            <div className="vf-select-wrap">
              <select
                className="vf-select"
                value={editKey}
                onChange={(e) => setEditKey(e.target.value)}
              >
                <option value="top">Prenda superior</option>
                <option value="bottom">Prenda inferior</option>
                <option value="coat">Abrigo</option>
              </select>
            </div>

            {/* Controles de tamaño */}
            <div className="vf-scale-group">
              <label className="vf-label">Tamaño</label>

              <div className="vf-scale-controls pro">
                {/* Botón menos */}
                <button
                  className="vf-icon-btn"
                  type="button"
                  disabled={!activeProd}
                  onMouseDown={(e) => startHold(e, () => tweakScale(editKey, -0.01))}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  title="Achicar (mantener para continuo) [ - ]"
                  aria-label="Achicar"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="11" width="14" height="2" rx="1" />
                  </svg>
                </button>

                {/* Slider + burbuja */}
                <div className="vf-range-wrap">
                  <input
                    className="vf-range pro"
                    type="range"
                    min="0.05"
                    max="1.5"
                    step="0.005"
                    value={Number(activeProd ? activeScale : activeBase.scale)}
                    disabled={!activeProd}
                    onChange={(e) => setScaleAbs(editKey, parseFloat(e.target.value))}
                    onInput={(e) => updateRangeFill(e.currentTarget)}
                  />
                  <span className="vf-bubble" data-unit="%">
                    {activeProd ? Math.round(activeScale * 100) : '—'}
                  </span>
                </div>

                {/* Botón más (press & hold) */}
                <button
                  className="vf-icon-btn"
                  type="button"
                  disabled={!activeProd}
                  onMouseDown={(e) => startHold(e, () => tweakScale(editKey, +0.01))}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  title="Agrandar (mantener para continuo) [ + ]"
                  aria-label="Agrandar"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="11" y="5" width="2" height="14" rx="1" />
                    <rect x="5" y="11" width="14" height="2" rx="1" />
                  </svg>
                </button>

                {/* Input fino en % */}
                <div className="vf-percent">
                  <input
                    type="number"
                    min={1}
                    max={150}
                    step={1}
                    disabled={!activeProd}
                    value={activeProd ? Math.round(activeScale * 100) : ""}
                    onChange={(e) => {
                      const v = Math.min(150, Math.max(5, Number(e.target.value || 0)));
                      setScaleAbs(editKey, v / 100);
                    }}
                  />
                  <span>%</span>
                </div>

                {/* Presets S / M / L */}
                <div className="vf-presets" role="group" aria-label="Presets de tamaño">
                  <button
                    className="vf-chip"
                    type="button"
                    disabled={!activeProd}
                    onClick={() => setScaleAbs(editKey, Math.max(0.08, (activeBase.scale * 0.8)))}
                    title="Chico (80% del base)"
                  >S</button>
                  <button
                    className="vf-chip"
                    type="button"
                    disabled={!activeProd}
                    onClick={() => setScaleAbs(editKey, activeBase.scale)}
                    title="Medio (base)"
                  >M</button>
                  <button
                    className="vf-chip"
                    type="button"
                    disabled={!activeProd}
                    onClick={() => setScaleAbs(editKey, Math.min(1.5, (activeBase.scale * 1.2)))}
                    title="Grande (120% del base)"
                  >L</button>
                </div>

                {/* Reset tamaño solo de la prenda activa */}
                <button
                  className="vf-btn vf-btn-ghost"
                  type="button"
                  disabled={!activeProd}
                  onClick={() => setScaleAbs(editKey, activeBase.scale)}
                  title="Resetear al tamaño base"
                >
                  Reset
                </button>

                {/* Hint de teclado */}
                <span className="vf-hint small">
                  Tips: rueda = ±1%, Shift+± = ±2%, flechas = mover prenda
                </span>
              </div>
            </div>

            <button className="vf-btn" onClick={onResetOriginal} type="button">
              Volver al estado original
            </button>

            {(hasRole('USER')) &&
              <button
                className="vf-btn vf-btn-primary vf-btn-cart"
                type="button"
                onClick={addOutfitToCart}
                disabled={adding || selectedProducts.length === 0}
                title={selectedProducts.length === 0 ? "Elegí al menos 1 prenda" : "Agregar outfit al carrito"}
                style={{ marginLeft: 8 }}
              >
                {adding ? "Agregando..." : "Agregar outfit al carrito"}
              </button>
            }
            {addMsg && <span className="vf-hint" style={{ marginLeft: 8 }}>{addMsg}</span>}
          </div>
        </header>

        <div className="vf-grid">
          {/* CONTROLES */}
          <aside className="vf-controls vf-card">
            {CATEGORIES.map((cat) => {
              const list = itemsByCat[cat.key] || [];
              const has = list.length > 0;
              const idx = indexes[cat.key];
              const current = idx >= 0 && has ? list[idx % list.length] : null;

              return (
                <div key={cat.key} className="vf-control-row">
                  <div className="vf-control-label">{cat.label}</div>

                  <div className="vf-arrows">
                    <button className="vf-arrow" onClick={() => cycle(cat.key, -1)} disabled={!has && idx !== -1}>◀</button>
                    <div className="vf-current-name">{current?.name || "Ninguna"}</div>
                    <button className="vf-arrow" onClick={() => cycle(cat.key, 1)} disabled={!has && idx !== -1}>▶</button>
                  </div>

                  <div className="vf-mini">
                    {current ? <img src={current.image} alt={current.name} /> : <div className="vf-mini-empty">—</div>}
                  </div>

                  <div className="vf-row-actions">
                    <button
                      className="vf-btn vf-btn-secondary"
                      type="button"
                      onClick={() => setIndexes(prev => ({ ...prev, [cat.key]: -1 }))}
                      title="Quitar prenda de esta capa"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              );
            })}
          </aside>

          {/* ESCENARIO */}
          <section
            className="vf-stage vf-card"
            onWheel={(e) => {
              if (!activeProd) return;
              const delta = e.deltaY > 0 ? -0.01 : 0.01;
              tweakScale(editKey, delta);
            }}
          >
            <img className="vf-mannequin" src={mannequin} alt="Maniquí" />

            {currentBottom && (
              <img
                className="vf-layer vf-layer-bottom"
                src={currentBottom.image}
                alt={currentBottom.name}
                style={styleFor("bottom", currentBottom)}
              />
            )}
            {currentTop && (
              <img
                className="vf-layer vf-layer-top"
                src={currentTop.image}
                alt={currentTop.name}
                style={styleFor("top", currentTop)}
              />
            )}
            {currentCoat && (
              <img
                className="vf-layer vf-layer-coat"
                src={currentCoat.image}
                alt={currentCoat.name}
                style={styleFor("coat", currentCoat)}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
