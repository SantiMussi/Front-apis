import React from "react";
import { createPortal } from "react-dom";
import "./AuthLoader.css";

const AuthLoader = ({ message = "Cargando..." }) => {
  // Contenido del overlay
  const overlay = (
    <div className="auth-loader-overlay">
      <div className="auth-loader-content">
        <h2>{message}</h2>
        <span className="login-spinner" />
      </div>
    </div>
  );

  // Render directo al <body> como popup real
  return createPortal(overlay, document.body);
};

export default AuthLoader;
