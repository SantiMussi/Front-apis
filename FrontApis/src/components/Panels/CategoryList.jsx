const CategoryList = ({ categories }) => {
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
            className="admin-btn edit"
            onClick={() => onEdit(category)}>
              Editar
            </button>
          </div>
        </li>
      ))}
      {categories.length === 0 && (
        <p className="admin-empty">No hay categorías disponibles.</p>
      )}
    </ul>
  );
}

export default CategoryList;