import {useEffect, useState} from "react";
import Products from "../components/Products";

export default function(){
    const [cats, setCats] = useState([]);
    const [sel, setSel] = useState("all");
    const BASE_URL = import.meta.env.VITE_API_URL;


   useEffect(() => {
    fetch(`${BASE_URL}/categories`)
      .then(async (res) => {
        if (!res.ok) {
          //403 u otros estados no exitosos
          const text = await res.text();
          throw new Error(`${res.status} ${text || res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        const raw =
          Array.isArray(data) ? data :
          Array.isArray(data.content) ? data.content : [];

          //Normaliza {id, label} siempre
          const list = raw.map((c) => {
            if(typeof c === "string"){
              return {id: c, label: c};
            }
            return{
              id: c?.id ?? c?.description ?? cryptoRandom(),
              label: c?.description ?? c?.name ?? String(c?.id ?? "Sin nombre"),
            }
          })
        setCats(list);
      })
      .catch(() => setCats([]));
  }, [BASE_URL]);

    const categoryForApi = sel === "all" ? null : sel;
    
    return(
    <main className="indumentaria-page">
      {/* Barra de categorías */}
      <div className="cat-bar">
        <button
          className={`cat-pill ${sel === "all" ? "active" : ""}`}
          onClick={() => setSel("all")}
        >
          Todas
        </button>

        {cats.map((c) => (
          <button
            key={c.id}
            className={`cat-pill ${sel === c.label ? "active" : ""}`}
            onClick={() => setSel(c.label)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <Products category={categoryForApi} />
    </main>
    )
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2);
}