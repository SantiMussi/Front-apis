import React from "react";
import Register from "../components/Register/Register.jsx";
import "../components/Register/Register.css";

const RegisterPage = () => {
  return (
    <div className="register-page">
        <div className="bg-shapes">
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
        </div>
      <div className="register-box">
        <Register />
      </div>
    </div>
  );
};

export default RegisterPage;
