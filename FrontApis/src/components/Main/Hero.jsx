import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  
  return (
    <section className="hero">
      <div className="bg-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <div className="hero-content">
        <h1>SZAFRANKUS</h1>
        <p>El click que cambia tu look</p>
        <button className="cta-button" onClick={() => navigate("/indumentaria")}>Explorar Ahora</button>
      </div>
    </section>
  );
}
