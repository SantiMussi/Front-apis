import { useNavigate } from "react-router-dom";
import ShinyText from "../Shiny/ShinyText"
import './Hero.css'

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
        <h1>
          <ShinyText 
          text="SZAFRANKUS"
          speed={3}
          className="hero-title"/>
          </h1>


          <p className="hero-subtitle">El click que cambia tu look</p>
        
        <button className="cta-button" onClick={() => navigate("/indumentaria")}>Explorar Ahora</button>
      </div>
    </section>
  );
}
