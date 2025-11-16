import PropTypes from "prop-types";

const CategoryList = ({ categories = [], onEdit, onDelete }) => {
  const hasCategories = Array.isArray(categories) && categories.length > 0;

  if (!hasCategories) {
    return (
      <div className="admin-empty">
        No hay categorías disponibles.
      </div>
    );
  }

  return (
    <ul className="admin-list categories">
      {categories.map((category) => {
        const title =
          category.description ||
          category.label ||
          category.name ||
          `Categoría #${category.id ?? "?"}`;

        return (
          <li key={category.id ?? title} className="admin-item">
            <div className="admin-item-main">
              <h3>{title}</h3>
              <p className="admin-item-meta">ID: {category.id ?? "-"}</p>
            </div>

            <div className="admin-item-actions">
              <button
                className="admin-button"
                type="button"
                onClick={() => onEdit?.(category)}
              >
                Editar
              </button>

              {onDelete && (
                <button
                  className="admin-button danger"
                  type="button"
                  onClick={() => onDelete(category)}
                  title="Eliminar categoría"
                >
                  Eliminar
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

CategoryList.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      description: PropTypes.string,
      label: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default CategoryList;
