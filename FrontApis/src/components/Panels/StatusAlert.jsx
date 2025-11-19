function StatusAlert({ status, onClose }) {
  if (!status) return null;

  const { type, message } = status;

  return (
    <div className={`admin-alert ${type} fixed`}>
      <span>{message}</span>
      <button
        type="button"
        className="admin-alert-close"
        onClick={onClose}
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );
}

export default StatusAlert;