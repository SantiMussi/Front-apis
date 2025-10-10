import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <div className="logo"><Link to="/">SZAFRANKUS</Link></div>

      <ul className="nav-links">
        <li><Link to="/nueva">Nueva</Link></li>
        <li><Link to="/indumentaria">Indumentaria</Link></li>
        <li><Link to="/hombre">Arma tu outfit</Link></li>
        <li><Link to="/colecciones">Colecciones</Link></li>
      </ul>

      <ul className="nav-links right">
        <li><Link to="/cart">Carrito</Link></li>
      </ul>
    </nav>
  );
}
