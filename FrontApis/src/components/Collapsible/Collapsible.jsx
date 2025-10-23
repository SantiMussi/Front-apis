// Collapsible.jsx
import PropTypes from "prop-types";
import { useId } from "react";
import "./Collapsible.css";

export default function Collapsible({
  id,
  title,
  subtitle,
  rightInfo,
  isOpen,
  onToggle,
  children,
  className = "",
}) {
  const contentId = useId();

  return (
    <div className={`admin-card ${className}`}>
      {/* Header completo clickeable */}
      <button
        type="button"
        className="admin-card-header"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => onToggle(id)}
      >
        <div className="header-left">
          <h2 className="collapsible-title">
            <span className="chevron" aria-hidden />
            {title}
          </h2>
          {subtitle && <p className="admin-subtitle">{subtitle}</p>}
        </div>

        {rightInfo && <span className="admin-right-info">{rightInfo}</span>}
      </button>

      {/* Contenido colapsable */}
      <div
        id={contentId}
        className={`collapsible-content ${isOpen ? "open" : ""}`}
        role="region"
        aria-labelledby={contentId}
      >
        <div className="collapsible-inner">{children}</div>
      </div>
    </div>
  );
}

Collapsible.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  rightInfo: PropTypes.node,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};
