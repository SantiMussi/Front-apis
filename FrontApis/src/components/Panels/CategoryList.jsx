import PropTypes from "prop-types";

const CategoryList = ({ categories = [], onEdit, onDelete }) => {
  return (
    <ul className="admin-list categories">
      {categories.map((category) => (
        <li key={category.id} className="admin-item">
          <div className="admin-item-main">
            <h3>{category.description || `Categoría #${category.id}`}</h3>
            <p className="admin-item-meta">ID: {category.id ?? "-"}</p>
          </div>
          <div className="admin-item-actions">
            <button
            className="admin-button"
            onClick={() => onEdit?.(category)}>
              Editar
            </button>

            {onDelete && (
              <button
              className='admin-button danger'
              onClick={() => onDelete(category)}
              title="Eliminar categoría">
                Eliminar 
                </button>
            )}
          </div>
        </li>
      ))}
      {categories.length === 0 && (
        <p className="admin-empty">No hay categorías disponibles.</p>
      )}
    </ul>
  );
}

CategoryList.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      description: PropTypes.string,
    })
  ),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default CategoryList;