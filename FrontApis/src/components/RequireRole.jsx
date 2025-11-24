import { Navigate, useLocation } from "react-router-dom";
import { hasRole, IsLoggedIn } from "../services/authService";
import { useDispatch } from "react-redux";
import { setLastPath } from "../redux/navSlice"

export default function RequireRole({ roles, children }) {
  const location = useLocation();

  // si no está logueado lo manda al login
  if (!IsLoggedIn()) {
    dispatch(setLastPath(location.pathname));
    return <Navigate to="/login" replace />;
  }

  // si está logueado pero no tiene el rol lo lleva al home
  return hasRole(...roles) ? children : <Navigate to="/" replace />;
}