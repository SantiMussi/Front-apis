function StatusAlert({ status }) {
  if (!status) return null;

  return <div className={`admin-alert ${status.type}`}>{status.message}</div>;
}

export default StatusAlert;