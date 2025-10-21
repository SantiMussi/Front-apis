import {useState} from "react";
import { register } from "../../services/authService"
import {useNavigate} from "react-router-dom";



function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        lastname: "",
        firstname: "",
        email: "",
        password: "",
    });

    // Estado para detectar si Caps Lock está activado
    const [capsLockOn, setCapsLockOn] = useState(false);

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
            const data = await register(
                formData.firstname,
                formData.lastname,
                formData.email,
                formData.password
            );


            //nav al login con un mensaje de cuenta creada exitosamente
            navigate("/login", {replace:true, state: {justRegistered: true}})


        } catch(err){
            console.error("Error al registrar: ", err)
            alert("Error al registrarse")
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
            </form>
        </div>
    )
}

export default Register;