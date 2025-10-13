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
        //cats es siempre un array
        const list =
          Array.isArray(data) ? data :
          Array.isArray(data.content) ? data.content : [];
        setCats(list);
      })
      .catch(() => setCats([]));
  }, [BASE_URL]);

    const categoryForApi = sel === "all" ? null : sel;
    
    return(
        <main className="indumentaria-page">
            {/*Barra para categorias */}
            <div className ="cat-bar">
                <button className={`cat-pill ${sel === "all" ? "active" : ""}`}  onClick={() => setSel("all")}>
                    Todas
                </button>
                {cats.map(c => (
                    <button key={c} className={`cat-pill ${sel === c ? "active" : ""} `} onClick={() => setSel(c)}>
                        {c}
                    </button>
                ))}
            </div>
            <Products category={categoryForApi}/>
        </main>
    )
}