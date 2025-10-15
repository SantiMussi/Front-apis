import React, { useState } from "react";
import AuthLoader from "./AuthLoader"; // <-- ruta relativa a este archivo
import { getCurrentUser, login, setRole, setToken} from "../../services/authService";
import "./LoginForm.css";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {

      //Loggea al usuario y guarda la data en localstorage
      const data = await login(email, password);
      if (data?.access_token) setToken(data.access_token);
      const user = await getCurrentUser();
      setRole(user.role);

      //Navega al ultimo path en el q estuvo
      const lastPath = localStorage.getItem("lastPath") || "/";
      navigate(lastPath, { replace: true });

    } catch (err) {
      setError(err?.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <AuthLoader message="Cargando..." />}
      <form onSubmit={handleSubmit} className="login-form">
        <h2 style={{ color: "var(--text)" }}>Iniciar sesión</h2>

        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="cta-button">Entrar</button>
      </form>
    </>
  );
};

export default LoginForm;
