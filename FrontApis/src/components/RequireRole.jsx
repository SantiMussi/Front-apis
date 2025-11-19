import { Navigate, useLocation } from "react-router-dom";
import { hasRole, isLoggedIn } from "../services/authService";
import {useSelector} from "react-redux";

export default function RequireRole({ roles, children }) {
  const location = useLocation();
  const selector = useSelector();

  // si no está logueado lo manda al login
  if (!isLoggedIn(selector)) {
    localStorage.setItem("lastPath", location.pathname);
    return <Navigate to="/login" replace />;
  }

  // si está logueado pero no tiene el rol lo lleva al home
  return hasRole(selector, ...roles) ? children : <Navigate to="/" replace />;
}