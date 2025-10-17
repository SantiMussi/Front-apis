import { ROLE_OPTIONS } from "../../constants/user";

/* Formatea el nombre para mostrar en la lista de usuarios */
const formatDisplayName = (user) =>
  [user.first_name, user.last_name].filter(Boolean).join(" ").trim();

const UserList = ({ users, onRoleChange, updatingUserId, roleOptions = ROLE_OPTIONS }) => {
  return (
    <div className="admin-list users">
      {users.map((user) => {
        const emailValue = user.email || "";
        const displayName = formatDisplayName(user) || "Usuario sin nombre";
        const normalizedRoleValue = (user.role ?? "").toString().trim().toUpperCase();
        return (
          <article
            key={user.id || user.email || emailValue || displayName}
            className="admin-item"
          >
            <div className="admin-item-main">
              <h3>{displayName}</h3>
              <p className="admin-item-meta">{emailValue || "Sin email"}</p>
              <label className="admin-item-meta">
                Rol:
                <select
                    className="admin-select"
                    value={normalizedRoleValue}
                    onChange={(event) => onRoleChange(user, event.target.value)}
                    disabled={updatingUserId === user.id}
                >
                  <option value="" disabled>
                    Seleccionar rol
                  </option>
                  {roleOptions.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {roleOption}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>
        );
      })}
      {users.length === 0 && (
        <p className="admin-empty">No hay usuarios disponibles.</p>
      )}
    </div>
  );
}

export default UserList;