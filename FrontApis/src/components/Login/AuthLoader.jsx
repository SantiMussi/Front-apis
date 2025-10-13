import React from 'react';
import './AuthLoader.css';

const Loader = ({ message = 'Cargando...'}) => (
    <div className="auth-loader-overlay">
        <div className="auth-loader-content">
            <h2>{message}</h2>
            <span className="login-spinner"/>
        </div>
    </div>
)

export default Loader;