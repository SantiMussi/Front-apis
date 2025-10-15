import { Navigate, useLocation } from "react-router-dom";
import { hasRole, isLoggedIn } from "../services/authService";

export default function RequireRole({ roles, children }) {
  const location = useLocation();

  // si no está logueado lo manda al login
  if (!isLoggedIn()) {
    localStorage.setItem("lastPath", location.pathname);
    return <Navigate to="/login" replace />;
  }

  // si está logueado pero no tiene el rol lo lleva al home
  return hasRole(...roles) ? children : <Navigate to="/" replace />;
}