import { getItemThumb } from "../../helpers/orderHelpers";

function formatCurrency(value, currency) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency,
    }).format(value ?? 0);
}

function OrderItemRow({ item, currency }) {
    const name = item?.name || "Ítem";
    const qty = item?.quantity;
    const price = item?.subtotal / item?.quantity;
    const lineTotal = item?.subtotal;
    const img = item?.base64img;

    return (
        <li className="order-item">
            <div className="order-item__visual">
                {img ? (
                    <img src={img} alt={name} />
                ) : (
                    <div className="vf-mini-empty">IMG</div>
                )}
            </div>
            <div className="order-item__main">
                <h4>{name}</h4>
                <p className="admin-item-meta">
                    Cantidad: {qty} · Precio unidad: {formatCurrency(price, currency)}
                </p>
            </div>
            <div className="order-item__total">{formatCurrency(lineTotal, currency)}</div>
        </li>
    );
}

export default function OrderItemsList({ items, currency }) {

    const list = Array.isArray(items) ? items : [];

    if(list.length === 0){
        return <div className='no-product compact'>Orden sin items</div>
    }

    return(
        <ul className="order-items">
            {list.map((item, idx) => (<OrderItemRow key={idx} item={item} currency={currency} />))}
        </ul>
    );
}