import "./Footer.css"
import {Link} from "react-router-dom";

export default function Footer() {
    return(
        <footer className="footer">
            <div className="footer-content">
                <p>© {new Date().getFullYear()} SZAFRANKUS. Todos los derechos reservados.</p>

                <p>
                    <Link to="/terminos">Términos y condiciones</Link>, {" "}
                    <Link to="/privacidad">Política de privacidad</Link>, {" "}
                    <a href="mailto:contacto@szafrankus.com">Contacto</a>, {" "}
                    <a href="https://www.instagram.com/santi.mussi">Instagram</a>
                </p>
            </div>
        </footer>
    )
}