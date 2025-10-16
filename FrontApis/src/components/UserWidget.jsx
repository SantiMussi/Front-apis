import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'
import { logout, isLoggedIn, hasRole } from '../services/authService'
import './UserWidget.css'

export default function UserWidget({ onLogout }) {
    const [open, setOpen] = useState(false);
    const logged = isLoggedIn();
    const menuRef = useRef(null)
    const iconRef = useRef(null);

    const handleToggle = () => setOpen(!open);
    const handleLogOut = () => {
        logout();
        onLogout?.();
        setOpen(false);
    }

    //Cerrar al hacer click afuera
    useEffect(() => {
        const handleClickOutsite = (e) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                iconRef.current &&
                !iconRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }

        if (open) document.addEventListener('mousedown', handleClickOutsite)
        return () => document.removeEventListener('mousedown', handleClickOutsite)
    }, [open]);

    return (
        <div className='user-widget'>
            <div
                className="user-icon"
                ref={iconRef}
                title='Mi cuenta'
                onClick={handleToggle}
            >
                <img
                    src="src/assets/user-avatar.png"
                    alt="usuario"
                    className="user-avatar"
                />
            </div>

            {open && (
                <div className='user-dropdown' ref={menuRef}>
                            {hasRole('USER') && (
                                <>
                                    <Link to="/orders" onClick={() => setOpen(false)}>Mis pedidos</Link>
                                    <Link to="/cart" onClick={() => setOpen(false)}>Carrito</Link>
                                </>
                            )}
                            {hasRole('SELLER') && <Link to='/seller/panel' onClick={() => setOpen(false)}>Panel vendedor</Link>}
                            {hasRole('ADMIN') && <Link to='/admin/panel' onClick={() => setOpen(false)}>Panel admin</Link>}

                            <button onClick={handleLogOut}>Salir</button>
                </div>)}
        </div>
    )
}