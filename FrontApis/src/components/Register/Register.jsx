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

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const data = await register(
                formData.firstname,
                formData.lastname,
                formData.email,
                formData.password
            );
            console.log("Usuario registrado: ", data);
            alert("Registro exitoso");


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
                    required
                />
            
                <button type="submit">Registrarse</button>
            </form>
        </div>
    )
}

export default Register;