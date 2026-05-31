// Lightweight modal surface for confirmations and forms.
export default function Modal({ open, title, children, footer, onClose }) {
  if (!open) {
    return null
  }

  return (
    <div className="ui-modal" role="presentation" onMouseDown={onClose}>
      <div className="ui-modal__dialog" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <div className="ui-modal__header">
          <h2 className="ui-modal__title">{title}</h2>
          <button type="button" className="ui-modal__close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="ui-modal__body">{children}</div>

        {footer && <div className="ui-modal__footer">{footer}</div>}
      </div>
    </div>
  )
}