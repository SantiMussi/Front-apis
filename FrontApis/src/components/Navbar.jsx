import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import UserWidget from "./UserWidget/UserWidget.jsx";
import "./UserWidget/UserWidget.css";
import { setLastPath } from "../redux/navSlice.js";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isAuth = useSelector((state) => !!state.auth.token);
  const role = useSelector((state) => state.auth.role);

  const isAdminOrSeller = role === "ADMIN" || role === "SELLER";

  // Guarda el último path
  useEffect(() => {
    if (!["/login", "/register"].includes(location.pathname)) {
      dispatch(setLastPath(location.pathname));
    }
  }, [location.pathname, dispatch]);

  const handleLogout = () => {
    // el UserWidget hace el dispatch(logout())
    navigate("/", { replace: true });
  };

  return (
    <nav>
      <div className="logo">
        <Link to="/" className="logo-link">
          SZAFRANKUS
        </Link>
      </div>

      <ul className="nav-links center">
        <li>
          <Link to="/indumentaria">Indumentaria</Link>
        </li>
        <li>
          <Link to="/virtual-fitter">Arma tu outfit</Link>
        </li>
      </ul>

      <ul className="nav-links right">
        {!isAuth && (
          <>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}

        {isAuth && !isAdminOrSeller && (
          <li>
            <Link
              to="/cart"
              className="cart-link"
              aria-label="Carrito"
              id="cart-icon"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="27"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </Link>
          </li>
        )}

        {isAuth && <UserWidget onLogout={handleLogout} />}
      </ul>
    </nav>
  );
}
