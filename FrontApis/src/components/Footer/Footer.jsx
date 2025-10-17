import "./Footer.css"

export default function Footer() {
    return(
        <footer className="footer">
            <div className="footer-content">
                <p>© {new Date().getFullYear()} SZAFRANKUS. Todos los derechos reservados.</p>

                <p>
                    <a href="/terminos">Términos y condiciones</a>, {" "}
                    <a href="/privacidad">Política de privacidad</a>, {" "}
                    <a href="mailto:contacto@szafrankus.com">Contacto</a>, {" "}
                    <a href="https://www.instagram.com/santi.mussi">Instagram</a>
                </p>
            </div>
        </footer>
    )
}