import { Navigate } from "react-router-dom"
import { hasRole } from '../services/authService'

export default function RequireRole({roles, children}){
    return hasRole(...roles) ? children : <Navigate to="/login" replace/>;
}