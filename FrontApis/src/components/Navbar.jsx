import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from "react-router-dom";
import { hasRole, isLoggedIn, getRole, onAuthChange, logout, getCurrentUser, setRole } from '../services/authService'
import UserWidget from "./UserWidget/UserWidget.jsx"
import './UserWidget/UserWidget.css'

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [auth, setAuth] = useState({
    isAuth: isLoggedIn(),
    role: getRole()
  });

  //Guarda el last path
  useEffect(() => {
    if (!['/login', '/register'].includes(location.pathname)) {
      localStorage.setItem('lastPath', location.pathname)
    }
  }, [location.pathname]);

  //Subscribe a cambios de auth (login, logout, role)
  useEffect(() => {
    const unsubscribe = onAuthChange(({ isLoggedIn, role }) => {
      setAuth({ isAuth: isLoggedIn, role })
    });

    //Estado inicial
    setAuth({ isAuth: isLoggedIn(), role: getRole() });

    (async () => {
      try {
        if (isLoggedIn()) {
          const me = await getCurrentUser();
          if (me?.role) setRole(me.role);
          setAuth({ isAuth: true, role: me?.role ?? getRole() });
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
        {auth.isAuth && !hasRole('ADMIN', 'SELLER') && (
          <>
            <Link to="/cart" className="cart-link" aria-label="Carrito">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
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
          </>
        )}
        {auth.isAuth && (<UserWidget onLogout={handleLogout} />)}

      </ul>
    </nav>
  );
}
