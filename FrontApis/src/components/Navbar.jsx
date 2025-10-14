import { Link } from "react-router-dom";
import {isAdmin} from '../services/authService'
export default function Navbar() {
  return (
    <nav>
      <div className="logo"><Link to ="/" className="logo-link">SZAFRANKUS</Link></div>

      <ul className="nav-links center">
        <li><Link to="/nueva">Nueva</Link></li>
        <li><Link to="/indumentaria">Indumentaria</Link></li>
        <li><Link to="/virtual-fitter">Arma tu outfit</Link></li>
      </ul>

      <ul className="nav-links right">
        <li><Link to="/cart">Carrito</Link></li>
        {isAdmin() && <li><Link to="/admin">Admin</Link></li>}
      </ul>
    </nav>
  );
}
