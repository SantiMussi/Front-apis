import React, { useState } from "react";
import AuthLoader from "./AuthLoader";
import "./LoginForm.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login as loginThunk } from "../../redux/authSlice"

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastPath = useSelector(state => state.nav.lastPath)


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const action = await dispatch(
      loginThunk({
        email,
        password,
      })
    )

    if(loginThunk.fulfilled.match(action)){
      navigate(lastPath, {replace: true})
    } else{
      setLocalError(action.error?.message || 'Error de autenticación');
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
