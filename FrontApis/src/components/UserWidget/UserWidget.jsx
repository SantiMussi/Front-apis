import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './UserWidget.css';
import userAvatar from '../../assets/user-avatar.png';
import gigachadAvatar from '../../assets/gigachad.png';
import { useDispatch, useSelector } from "react-redux";
import { logout } from '../../redux/authSlice';
import { hasRole } from "../../services/authService"
import Swal from 'sweetalert2';


export default function UserWidget({ onLogout }) {
    const [open, setOpen] = useState(false);

    const menuRef = useRef(null);
    const iconRef = useRef(null);

    const dispatch = useDispatch();

    const logged = useSelector((state) => !!state.auth.token);
    const handleToggle = () => setOpen(v => !v);

    const handleLogOut = async () => {
        const result = await Swal.fire({
            title: "¿Cerrar sesión?",
            html: "<b>Tu carrito será borrado.</b><br/>¿Seguro que querés continuar?",
            icon: "warning",
            background: "#111",
            color: "#fff",
            showCancelButton: true,
            confirmButtonColor: "#ff3b3b",
            cancelButtonColor: "#444",
            confirmButtonText: "Sí, cerrar sesión",
            cancelButtonText: "Volver",
        });


        if (result.isConfirmed) {
            dispatch(logout());
            onLogout?.();
            setOpen(false);

            await Swal.fire({
                title: "Sesión cerrada",
                text: "Tu carrito ha sido borrado.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });
        }
    };

    let avatarSrc = userAvatar;
    const roleClass = hasRole('ADMIN') ? 'admin' : hasRole('SELLER') ? 'seller' : 'user';
    if (hasRole('ADMIN')) {
        avatarSrc = gigachadAvatar;
    }

    // Cerrar click afuera
    useEffect(() => {
        const onDocClick = (e) => {
            if (
                open &&
                menuRef.current && !menuRef.current.contains(e.target) &&
                iconRef.current && !iconRef.current.contains(e.target)
            ) setOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [open]);

    // Cerrar con Escape
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    if (!logged) return null;

    return (
        <div className="user-widget">
            <button
                className="user-icon"
                ref={iconRef}
                title="Mi cuenta"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={handleToggle}
            >
                <span className="user-icon-inner">
                    <img src={avatarSrc} alt="usuario" className="user-avatar" />
                </span>
                <span className={`user-role-dot ${roleClass}`} aria-hidden="true" />
            </button>

            {open && (
                <div
                    className="user-dropdown"
                    ref={menuRef}
                    role="menu"
                    aria-label="Menú de usuario"
                >
                    {hasRole('USER') && (
                        <>
                            <Link role="menuitem" to="/orders" onClick={() => setOpen(false)}>
                                Mis pedidos
                            </Link>
                            <Link role="menuitem" to="/cart" onClick={() => setOpen(false)}>
                                Carrito
                            </Link>
                            <div className="menu-sep" />
                        </>
                    )}

                    {hasRole('SELLER') && (
                        <>
                            <Link role="menuitem" to="/seller/panel" onClick={() => setOpen(false)}>
                                Panel vendedor
                            </Link>
                            <div className="menu-sep" />
                        </>
                    )}

                    {hasRole('ADMIN') && (
                        <>
                            <Link role="menuitem" to="/admin/panel" onClick={() => setOpen(false)}>
                                Panel admin
                            </Link>
                            <div className="menu-sep" />
                        </>
                    )}

                    <button role="menuitem" onClick={handleLogOut}>Salir</button>
                </div>
            )}
        </div>
    );
}
