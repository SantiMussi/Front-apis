import {useCallback, useEffect, useState} from "react";

export default function useOrdersPager(fetchFunction, {page, size, deps = []}){
    const [orders, setOrders] =  useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setErr("");
        try{
            const {payload, status} = await fetchFunction({page, size});

            //401 // 204 // 404
            if(status === 401 || status === 204 || status === 404){
                setOrders([]);
                setTotalPages(1);
                setErr("");
                setLoading(false);
                return;
            }

            if(status < 200 || status >= 300){
                throw new Error("No pudimos cargar las órdenes. Probá más tarde.");
            }

            //Normalizacion

            let items = [];
            let pages = 1;

            if(Array.isArray(payload?.content)){
                items = payload.content;
                pages = payload.totalPages || 1;
            }
            else if(Array.isArray(payload)){
                items = payload;
            } else if(Array.isArray(payload?.items)){
                items = payload.items;
                pages = payload.totalPages || 1;
            }
            setOrders(items);
            setTotalPages(pages);
        } catch(e){
            setErr(e?.message || "No pudimos cargar las órdenes. Probá más tarde.");
            setOrders([]);
            setTotalPages(1);
        } finally{
            setLoading(false);
        }
    }, [fetchFunction, page, size, ...deps]);

    useEffect(() => {load(); }, [load]);

    return{orders, totalPages, loading, err, reload: load, setOrders};

}