import {useState} from "react";
import { register } from "../../services/authService"
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";



function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        lastname: "",
        firstname: "",
        email: "",
        password: "",
    });

    // Estado para detectar si Caps Lock está activado
    const [capsLockOn, setCapsLockOn] = useState(false);

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    // Maneja eventos de teclado para detectar Caps Lock
    const handlePasswordKey = (e) => {
        if (typeof e.getModifierState === "function") {
        setCapsLockOn(Boolean(e.getModifierState("CapsLock")));
        }
    };

    const handlePasswordBlur = () => setCapsLockOn(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            setError("");


            const data = await register(
                dispatch,
                formData.firstname,
                formData.lastname,
                formData.email,
                formData.password 
            );

            console.log(data);

            //nav al login con un mensaje de cuenta creada exitosamente
            navigate("/login", {replace:true, state: {justRegistered: true}})


        } catch(err){
            //console.error("Error al registrar: ", err)
            setError("Error al registrarse: El mail ya está registrado.")
        }
    };

    return(
        <div className="register-container">
            <h2>Registro</h2>
            <form onSubmit={handleSubmit}>
                
                <input
                    type="text"
                    name="firstname"
                    placeholder="Nombre"
                    onChange={handleChange} 
                    required
                />
                <input
                    type="text"
                    name="lastname"
                    placeholder="Apellido"
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    onChange={handleChange}
                    onKeyDown={handlePasswordKey}
                    onKeyUp={handlePasswordKey}
                    onFocus={handlePasswordKey}
                    onBlur={handlePasswordBlur}
                    required
                />

                {/* Aviso accesible sobre Caps Lock */}
                <div
                role="status"
                aria-live="polite"
                style={{
                    color: "#e07a5f",
                    fontSize: "0.9rem",
                    marginTop: "6px",
                    height: "1.2rem",
                }}
                >          
                    {capsLockOn ? "Caps Lock / Bloc Mayús está activo." : ""}
                </div>
            
                <button type="submit">Registrarse</button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    )
}

export default Register;