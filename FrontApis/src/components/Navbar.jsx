import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from "react-router-dom";
import { hasRole, isLoggedIn, getRole, onAuthChange, logout, getCurrentUser, setRole } from '../services/authService'
import UserWidget from "../components/UserWidget.jsx"

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
          <Link to="/cart" className="cart-link" aria-label="carrito">🛒</Link>
          </>
        )}
        {auth.isAuth && (<UserWidget onLogout={handleLogout} />)}

      </ul>
    </nav>
  );
}
