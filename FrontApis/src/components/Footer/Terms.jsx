import "./LegalPages.css"

const Terms = () => {
    return (
         <main className="legal-page terms-page">
            <div className="legal-wrapper">
                <header className="legal-header">
                    <p className="legal-tag">Última actualización: 18/10/2025</p>
                    <h1>Términos y Condiciones</h1>
                    <p>
                        Bienvenido/a a Szafrankus (en adelante, "el Sitio"). Al acceder y utilizar este sitio web aceptás
                        cumplir con los siguientes Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos
                        términos, te pedimos que no utilices el Sitio.
                    </p>
                </header>

                <section className="legal-card">
                    <h2>1. Información General</h2>
                    <p>
                        El Sitio es operado por Szafrankus SA, con domicilio en Lima 757. Nos dedicamos a la comercialización
                        de ropa y accesorios a través de internet.
                    </p>
                </section>

                <section className="legal-card">
                    <h2>2. Uso del Sitio</h2>
                    <p>
                        Al utilizar este Sitio, declarás que tenés al menos 18 años o que contás con el consentimiento de tus
                        padres o tutores legales. Te comprometés a usar el Sitio de forma lícita, sin infringir derechos ni
                        afectar negativamente su funcionamiento.
                    </p>
                </section>

                <section className="legal-card">
                    <h2>3. Productos y Precios</h2>
                    <p>
                        Los productos ofrecidos en el Sitio están sujetos a disponibilidad. Nos reservamos el derecho de
                        modificar o discontinuar productos sin previo aviso. Todos los precios están expresados en pesos
                        argentinos (ARS) e incluyen los impuestos aplicables, salvo que se indique lo contrario.
                    </p>
                </section>

                <section className="legal-card">
                    <h2>4. Proceso de Compra</h2>
                    <p>
                        Para realizar una compra, deberás seguir los pasos indicados en el Sitio. Una vez confirmada la compra,
                        recibirás un correo electrónico con el resumen del pedido. El envío se realizará conforme a las
                        políticas de entrega establecidas en el Sitio.
                    </p>
                </section>

                <section className="legal-card">
                    <h2>5. Pagos</h2>
                    <p>Aceptamos los siguientes medios de pago:</p>
                    <ul className="legal-list">
                        <li>Transferencia bancaria.</li>
                        <li>Tarjetas de crédito (Mastercard, American Express).</li>
                        <li>Tarjetas de débito (Visa, Mastercard, American Express).</li>
                    </ul>
                    <p>
                        Las transacciones son procesadas a través de plataformas seguras y no almacenamos información sensible
                        de tarjetas de crédito o débito.
                    </p>
                </section>

                <section className="legal-card">
                    <h2>6. Envíos y Entregas</h2>
                    <p>
                        Los envíos se realizan a través de Mercado Envíos y Correo Argentino. Los plazos de entrega son
                        estimativos y pueden variar según la ubicación. No nos responsabilizamos por demoras atribuibles al
                        servicio de mensajería.
                    </p>
                </section>

                <section className="legal-card">
                    <h2>7. Cambios y Devoluciones</h2>
                    <p>
                        Aceptamos cambios y devoluciones dentro del plazo de 7 días desde la recepción del producto, siempre
                        que el artículo esté en perfectas condiciones, sin uso y con su empaque original. Para más información,
                        consultá nuestra política de cambios y devoluciones.
                    </p>
                </section>

                <section className="legal-card">
                    <h2>8. Propiedad Intelectual</h2>
                    <p>
                        Todo el contenido del Sitio (textos, imágenes, logotipos, diseños, etc.) es propiedad de Szafrankus SA
                        o de sus respectivos autores y está protegido por las leyes de propiedad intelectual. Queda prohibida
                        su reproducción sin autorización expresa.
                    </p>
                </section>

                <section className="legal-card">
                    <h2>9. Protección de Datos</h2>
                    <p>
                        La información personal proporcionada será tratada de acuerdo con nuestra Política de Privacidad. No
                        compartimos tus datos con terceros sin tu consentimiento, salvo en los casos legalmente permitidos.
                    </p>
                </section>

                <section className="legal-card">
                    <h2>10. Modificaciones</h2>
                    <p>
                        Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Las
                        modificaciones entrarán en vigencia desde su publicación en el Sitio. Te recomendamos revisar estos
                        términos periódicamente.
                    </p>
                </section>

                <section className="legal-card">
                    <h2>11. Jurisdicción y Ley Aplicable</h2>
                    <p>
                        Estos Términos se rigen por las leyes de Argentina. Cualquier controversia que pudiera derivarse del uso
                        del Sitio será sometida a los tribunales competentes de Argentina.
                    </p>
                </section>

                <footer className="legal-footer">
                    <p>
                        ¿Necesitás ayuda? Escribinos a
                        {" "}
                        <a href="mailto:contacto@szafrankus.com">contacto@szafrankus.com</a>
                        {" "}
                        y estaremos encantados de asistirte.
                    </p>
                </footer>
            </div>
        </main>

    )
}

export default Terms;
