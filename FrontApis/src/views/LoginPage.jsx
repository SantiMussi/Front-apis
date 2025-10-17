// src/views/LoginPage.jsx
import React from "react";
import { useLocation, Link } from "react-router-dom";
import LoginForm from "../components/Login/LoginForm";
import "../components/Login/LoginForm.css";

const LoginPage = () => {
  const location = useLocation();
  const justRegistered = location.state?.justRegistered;

  return (
    <div className="page-container">
        <div className="bg-shapes">
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
        </div>
      {justRegistered && (
        <p className="success-message">
          Cuenta creada correctamente, iniciá sesión.
        </p>
      )}

      <LoginForm />

      <p className="redirect-text">
        ¿No tenés una cuenta?{" "}
        <Link to="/register" className="redirect-link">
          Registrate acá
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
