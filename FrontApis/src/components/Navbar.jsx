import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <div className="logo"><Link to ="/" className="logo-link">SZAFRANKUS</Link></div>

      <ul className="nav-links">
        <li><Link to="/nueva">Nueva</Link></li>
        <li><Link to="/indumentaria">Indumentaria</Link></li>
        <li><Link to="/outfit">Arma tu outfit</Link></li>
      </ul>

      <ul className="nav-links right">
        <li><Link to="/cart">Carrito</Link></li>
      </ul>
    </nav>
  );
}
