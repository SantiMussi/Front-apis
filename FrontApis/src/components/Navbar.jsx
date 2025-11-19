import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from "react-router-dom";
import { hasRole, isLoggedIn, getRole, onAuthChange, logout, getCurrentUser, setRole } from '../services/authService'
import UserWidget from "./UserWidget/UserWidget.jsx"
import './UserWidget/UserWidget.css'
import {useDispatch, useSelector} from "react-redux";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const selector = useSelector();

  const [auth, setAuth] = useState({
    isAuth: isLoggedIn(selector),
    role: getRole(selector)
  });

  //Guarda el last path
  useEffect(() => {
    if (!['/login', '/register'].includes(location.pathname)) {
      localStorage.setItem('lastPath', location.pathname)
    }
  }, [location.pathname]);

  //Subscribe a cambios de auth (login, logout, role)
  useEffect((selector) => {
    const unsubscribe = onAuthChange(selector,({ isLoggedIn, role } ) => {
      setAuth({ isAuth: isLoggedIn, role })
    });

    //Estado inicial
    setAuth({ isAuth: isLoggedIn(selector), role: getRole(selector) });

    (async () => {
      try {
        if (isLoggedIn(selector)) {
          const me = await getCurrentUser();
          if (me?.role) setRole(dispatch, me.role);
          setAuth({ isAuth: true, role: me?.role ?? getRole(selector) });
        }
      } catch (e) {
        logout();
        setAuth({ isAuth: false, role: null })
      }
    })();

    return unsubscribe;
  }, [])

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  }

  const isAdminOrSeller = auth.role === "ADMIN" || auth.role === "SELLER";

  return (
    <nav>
      <div className="logo"><Link to="/" className="logo-link">SZAFRANKUS</Link></div>

      <ul className="nav-links center">
        <li><Link to="/nueva">Nueva</Link></li>
        <li><Link to="/indumentaria">Indumentaria</Link></li>
        <li><Link to="/virtual-fitter">Arma tu outfit</Link></li>
      </ul>

      <ul className="nav-links right">
        {!auth.isAuth && (
          <>
            <Link to="/login">Iniciar sesión</Link>
            <Link to='/register'>Registrarse</Link>
          </>
        )}
        {auth.isAuth && !hasRole(selector,'ADMIN', 'SELLER') && (
          <li>
            <Link to="/cart" className="cart-link" aria-label="Carrito">
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
        {auth.isAuth && (<UserWidget onLogout={handleLogout} />)}

      </ul>
    </nav>
  );
}
