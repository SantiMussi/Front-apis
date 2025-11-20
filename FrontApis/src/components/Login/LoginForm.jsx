import React, { useState } from "react";
import AuthLoader from "./AuthLoader"; // <-- ruta relativa a este archivo
import { getCurrentUser, login, SetRole, SetToken} from "../../services/authService";
import "./LoginForm.css";
import { useNavigate } from "react-router-dom";

import {useDispatch} from "react-redux";

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();


    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {

      //Loggea al usuario y guarda la data en localstorage
      const data = await login(dispatch, email, password);

      //console.log(data)


      if (data?.access_token) SetToken(data.access_token, dispatch);
      const user = await getCurrentUser();
      SetRole(user.role, dispatch);

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

        {error && <p className="error-message">Error: {error}</p>}

        <button type="submit" className="cta-button">Entrar</button>
      </form>
    </>
  );
};

export default LoginForm;
