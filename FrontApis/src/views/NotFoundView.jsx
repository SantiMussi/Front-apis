import { useNavigate } from "react-router-dom";

const NotFoundView = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <h2>404 - Página no encontrada</h2>
      <p>Lo sentimos, la página que usted está buscando no existe.</p>

      <div className="not-found-actions">
        <button
          type="button"
          className="back-link"
          onClick={() => navigate(-1)}
        >
          Volver
        </button>

        <button
          type="button"
          className="back-link"
          onClick={() => navigate("/")}
          style={{ marginLeft: "0.5rem" }}
        >
          Ir al inicio
        </button>
      </div>
    </div>
  );
};

export default NotFoundView;