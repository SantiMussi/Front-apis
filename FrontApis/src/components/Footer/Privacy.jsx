import "./LegalPages.css"

const Privacy = () => {
    return (
        <main className="legal-page privacy-page">
        <div className="legal-wrapper">
            <header className="legal-header">
                <p className="legal-tag">Fecha de última actualización: 18/10/2025</p>
                <h1>Política de Privacidad</h1>
                <p>En <strong>Szafrankus</strong> (en adelante, “la Tienda”, “nosotros” o “nuestro”), nos
                    comprometemos a proteger la privacidad de nuestros usuarios y clientes. Esta Política de Privacidad
                    describe cómo recopilamos, usamos, almacenamos y protegemos los datos personales que nos
                    proporcionás a través de nuestro sitio web.
                </p>
            </header>

            <section className="legal-card">
                <h2>1. Responsable del tratamiento de los datos</h2>
                <p>
                    <strong>Szafrankus S.A.</strong>
                    <br/>
                    Domicilio: Lima 757
                    <br/>
                    Correo electrónico de contacto: <a href="mailto:contacto@szafrankus.com">contacto@szafrankus.com</a></p>
            </section>

            <section className="legal-card">
                <h2>2. Datos personales que recolectamos</h2>
                <p>Podemos recopilar los siguientes datos personales cuando interactuás con nuestro sitio:</p>
                <ul className="legal-list">
                    <li>Nombre y apellido</li>
                    <li>DNI (si se requiere para facturación)</li>
                    <li>Dirección de correo electrónico</li>
                    <li>Número de teléfono</li>
                    <li>Domicilio de entrega y facturación</li>
                    <li>Datos de medios de pago (procesados por plataformas de pago seguras)</li>
                    <li>Información sobre tus compras, preferencias y comportamiento de navegación</li>
                </ul>
            </section>

            <section className="legal-card">
                <h2>3. Finalidad del tratamiento</h2>
                <p>Usamos los datos recopilados para las siguientes finalidades:</p>
                <ul className="legal-list">
                    <li>Procesar y gestionar tus pedidos</li>
                    <li>Enviar confirmaciones de compra y notificaciones</li>
                    <li>Atender consultas o reclamos</li>
                    <li>Enviar comunicaciones promocionales (con tu consentimiento)</li>
                    <li>Cumplir con obligaciones legales y fiscales</li>
                    <li>Mejorar nuestros productos y servicios</li>
                </ul>
            </section>

            <section className="legal-card">
                <h2>4. Base legal</h2>
                <p>El tratamiento de tus datos personales se realiza con base en:</p>
                <ul className="legal-list">
                    <li>Tu consentimiento expreso</li>
                    <li>La necesidad de ejecutar un contrato</li>
                    <li>Obligaciones legales aplicables</li>
                </ul>
            </section>

            <section className="legal-card">
                <h2>5. Almacenamiento y seguridad</h2>
                <p>Almacenamos tus datos en servidores seguros y aplicamos medidas técnicas y organizativas para
                    protegerlos contra accesos no autorizados, pérdida o alteración.</p>
            </section>

            <section className="legal-card">
                <h2>6. Cesión de datos a terceros</h2>
                <p>No compartimos tus datos personales con terceros, salvo en los siguientes casos:</p>
                <ul className="legal-list">
                    <li>Proveedores de servicios (logística, pagos, marketing, etc.)</li>
                    <li>Requerimientos legales de autoridades judiciales o administrativas</li>
                </ul>
            </section>

            <section className="legal-card">
                <h2>7. Derechos del titular de los datos</h2>
                <p>De acuerdo con la Ley 25.326, tenés derecho a:</p>
                <ul className="legal-list">
                    <li>Acceder a tus datos personales</li>
                    <li>Rectificarlos si son inexactos</li>
                    <li>Solicitar su supresión</li>
                    <li>Oponerte al tratamiento con fines publicitarios</li>
                    <li>Retirar tu consentimiento en cualquier momento</li>
                </ul>
                <p>Para ejercer estos derechos, escribinos a: <a href="mailto:contacto@szafrankus.com">contacto@szafrankus.com</a></p>
                <p><strong>IMPORTANTE:</strong> La Agencia de Acceso a la Información Pública, órgano de control de la
                    Ley N.º 25.326, tiene la atribución de atender denuncias y reclamos. Sitio web: <a
                        href="https://www.argentina.gob.ar/aaip" target="_blank">www.argentina.gob.ar/aaip</a></p>
            </section>

            <section className="legal-card">
                <h2>8. Cookies y tecnologías similares</h2>
                <p>Usamos cookies y tecnologías similares para mejorar tu experiencia de navegación. Podés configurar tu
                    navegador para rechazarlas, aunque esto podría afectar el funcionamiento del sitio.</p>
            </section>

            <section className="legal-card">
                <h2>9. Modificaciones a esta política</h2>
                <p>Nos reservamos el derecho de modificar esta Política de Privacidad. Las modificaciones entrarán en
                    vigor una vez publicadas en el sitio. Te recomendamos revisarla periódicamente.</p>
            </section>

            </div>
        </main>


    )
}

export default Privacy
