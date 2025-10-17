import { useEffect, useMemo, useState, useCallback } from "react";
import mannequin from "../../assets/mannequin.png";
import "./VirtualFitter.css";

const BASE_URL = import.meta.env.VITE_API_URL;

/** Calibración por capa (defaults) */
const LAYER_DEFAULTS = {
  top:    { scale: 0.17, x: 1.2, y: -3.5, z: 30 },
  bottom: { scale: 0.40, x: 0.8, y: 17.5, z: 20 },
  coat:   { scale: 0.24, x: 1.0, y: -4.5, z: 40 },
};

/** Mapeo de categorías lógicas */
const CATEGORIES = [
  { key: "top",    label: "Prenda superior", apiValues: ["Remera"] },
  { key: "bottom", label: "Prenda inferior", apiValues: ["Pantalon", "Short", "Jean"] },
  { key: "coat",   label: "Abrigo",          apiValues: ["Abrigo", "Polar", "Hoodie"] },
];

/** LS helpers */
function getOverridesFromLS() {
  try { return JSON.parse(localStorage.getItem("vf_overrides")) || {}; }
  catch { return {}; }
}
function saveOverridesToLS(map) {
  localStorage.setItem("vf_overrides", JSON.stringify(map));
}

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
  };
}

export default function VirtualFitter() {
  // ---- estado ----
  const [itemsByCat, setItemsByCat] = useState({ top: [], bottom: [], coat: [] });
  const [indexes, setIndexes] = useState({ top: 0, bottom: 0, coat: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [cal, setCal] = useState(LAYER_DEFAULTS);        // calibración global por capa
  const [overrides, setOverrides] = useState(getOverridesFromLS); // ajustes por producto
  const [editKey, setEditKey] = useState("top");         // capa activa para ediciones

  // ---- helpers ----
  const bucketize = (all) => {
    const out = { top: [], bottom: [], coat: [] };
    const isIn = (name, list) =>
      list.some((x) => x.toLowerCase() === String(name).toLowerCase());
    for (const raw of all) {
      const p = mapProduct(raw);
      if (!p.image) continue;
      if (isIn(p.categoryName, CATEGORIES.find(c => c.key === "top").apiValues)) out.top.push(p);
      if (isIn(p.categoryName, CATEGORIES.find(c => c.key === "bottom").apiValues)) out.bottom.push(p);
      if (isIn(p.categoryName, CATEGORIES.find(c => c.key === "coat").apiValues)) out.coat.push(p);
    }
    return out;
  };

  // carga
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/product`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
        if (!mounted) return;
        setItemsByCat(bucketize(list));
      } catch (e) {
        setErr(e.message || "Error al cargar productos");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const currentTop    = useMemo(() => itemsByCat.top[indexes.top] || null,       [itemsByCat.top, indexes.top]);
  const currentBottom = useMemo(() => itemsByCat.bottom[indexes.bottom] || null, [itemsByCat.bottom, indexes.bottom]);
  const currentCoat   = useMemo(() => itemsByCat.coat[indexes.coat] || null,     [itemsByCat.coat, indexes.coat]);

  const cycle = useCallback((key, dir = 1) => {
    setIndexes((prev) => {
      const list = itemsByCat[key] || [];
      if (list.length === 0) return prev;
      const len = list.length;
      const nextIndex = ((prev[key] ?? 0) + dir + len) % len;
      return { ...prev, [key]: nextIndex };
    });
  }, [itemsByCat]);

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
    saveOverridesToLS(updated);
  };

  // atajos de teclado
  useEffect(() => {
    const onKey = (e) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault();
      const step = e.shiftKey ? 1 : 0.5;
      if (e.key === "ArrowUp")    nudge(editKey, 0, -step);
      if (e.key === "ArrowDown")  nudge(editKey, 0,  step);
      if (e.key === "ArrowLeft")  nudge(editKey, -step, 0);
      if (e.key === "ArrowRight") nudge(editKey,  step, 0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editKey, currentTop, currentBottom, currentCoat, overrides, cal]);

  // estilo final = base por capa + override por producto (si existe)
  function styleFor(layerKey, prod) {
    const base = cal[layerKey];
    const ov   = prod ? overrides[prod.id] : null;
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
    setIndexes({ top: 0, bottom: 0, coat: 0 });
    setCal(LAYER_DEFAULTS);
    setOverrides({});
    localStorage.removeItem("vf_overrides");
  };

  if (loading) return <div className="vf-loading">Cargando prendas…</div>;
  if (err)      return <div className="vf-error">Error: {err}</div>;

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

            <button className="vf-btn" onClick={onResetOriginal} type="button">
              Volver al estado original
            </button>
          </div>
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
                    <button className="vf-arrow" onClick={() => cycle(cat.key, -1)} disabled={!has}>◀</button>
                    <div className="vf-current-name">{current?.name || "Sin productos"}</div>
                    <button className="vf-arrow" onClick={() => cycle(cat.key, 1)} disabled={!has}>▶</button>
                  </div>

                  <div className="vf-mini">
                    {has ? <img src={current.image} alt={current.name} /> : <div className="vf-mini-empty">—</div>}
                  </div>
                </div>
              );
            })}
          </aside>

          {/* ESCENARIO */}
          <section className="vf-stage vf-card">
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
