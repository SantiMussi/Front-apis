export default function Navbar() {
  return (
    <nav>
      <div className="logo">SZAFRANKUS</div>

      <ul className="nav-links">
        <li><a href="#nueva">Nueva</a></li>
        <li><a href="#indumentaria">Indumentaria</a></li>
        <li><a href="#hombre">Arma tu outfit</a></li>
        <li><a href="#colecciones">Colecciones</a></li>
      </ul>

      <ul className="nav-links right">
        <li><a href="#carrito">Carrito</a></li>
      </ul>
    </nav>
  );
}
