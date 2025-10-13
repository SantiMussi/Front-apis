import React, { useState } from 'react';
import Loader from './AuthLoader.jsx'
import { login } from '../../services/authService.js';
import './LoginForm.css';
import {useNavigate} from "react-router-dom";



const LoginForm = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try{
            const data = await login(email, password);
            if (data?.token) {
                localStorage.setItem('token', data.token);
            }
            console.log('Respuesta de autenticacion: ', data);

            //nav a la ultima pagina que estuvo
            const lastPath = localStorage.getItem("lastPath") || "/";
            navigate(lastPath, {replace: true});
            
        } catch(err){
            setError(err.message);
        } finally{
            setLoading(false);
        }
    };

    return(
        <>
        {loading && <Loader />}
        <form onSubmit={handleSubmit} className="login-form">
            <h2 style={{color: 'var(--text)'}}>Iniciar sesión</h2>
            <label htmlFor="email">Correo electrónico</label>
            <input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <label htmlFor="password">Constraseña</label>

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
    )
};

export default LoginForm;