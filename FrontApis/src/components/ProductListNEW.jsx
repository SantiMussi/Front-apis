import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/productsSlice';

const ProductListNEW = () => {
    const dispatch = useDispatch()
    const { products, error, loading } = useSelector((state) => state.products)

    useEffect(() => {
        dispatch(fetchProducts)
    }, [dispatch])

    if (loading) return (
        <div className="loading"><div className="spinner"></div><p>Cargando productos...</p></div>
    );

    if (error) {
        console.error("Error al cargar productos:", error);
        return (
        <div className='no-product'>Error al cargar productos</div>
    )
    }
    return (
        <section className="productos">
            <div className="productos-grid">
                {products.map((p) => {
                    const priceValue = Number(p.price ?? 0);
                    const discountValue = Number(p.discount ?? 0);
                    const hasDiscount = Number.isFinite(discountValue) && discountValue > 0;
                    const finalPrice = hasDiscount ? priceValue * (1 - discountValue) : priceValue;

                    return (
                        <div key={p.id} className="producto-card">
                            <img src={p.base64img} alt={p.name} />
                            <h3>{p.name}</h3>
                            <div className="price-block">
                                {/* Precio actual con descuento */}
                                <span className="price-current">
                                    ${finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>

                                {/* Si tiene descuento, mostrar original y porcentaje arriba */}
                                {hasDiscount && (
                                    <div className="price-discount-details">
                                        <span className="price-original">
                                            ${priceValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        <span className="price-tag">-{Math.round(discountValue * 100)}%</span>
                                    </div>
                                )}
                            </div>
                            <Link to={`/product/${p.id}`} className="detail-btn">Ver más</Link>
                        </div>
                    );
                })}
                {products.length === 0 && (<div className="no-product">No hay productos en esta categoría.</div>)}
            </div>
        </section>
    );
}
export default ProductListNEW;