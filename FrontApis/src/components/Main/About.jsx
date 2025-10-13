export default function About() {
  return (
    <section id="about" className="about">
      <div className="about-inner">
        <h2 className="about-title">SOBRE SZAFRANKUS</h2>
        <p className="about-subtitle">
          Diseñamos prendas versátiles con estética minimal y actitud urbana. Calidad, calce y detalles.
        </p>

        <div className="about-grid">
          <div className="about-card">
            <h3>Materiales</h3>
            <p>Textiles seleccionados y procesos pensados para durar, sin perder confort.</p>
          </div>
          <div className="about-card">
            <h3>Diseño</h3>
            <p>Líneas limpias, siluetas modernas y foco en el uso real de todos los días.</p>
          </div>
          <div className="about-card">
            <h3>Hecho acá</h3>
            <p>Producción local, lotes cuidados y controles de calidad en cada etapa.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
