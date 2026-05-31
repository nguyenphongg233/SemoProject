// Labeled text field with built-in error and helper text rendering.
export default function TextField({
  label,
  error,
  helpText,
  className = '',
  id,
  ...props
}) {
  const fieldId = id || props.name
  const describedBy = [error ? `${fieldId}-error` : null, helpText ? `${fieldId}-help` : null]
    .filter(Boolean)
    .join(' ')

  return (
    <label className={`ui-field ${className}`.trim()} htmlFor={fieldId}>
      <span className="ui-field__label">{label}</span>
      <input
        id={fieldId}
        className={`ui-input ${error ? 'ui-input--error' : ''}`.trim()}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      {helpText && !error && (
        <span id={`${fieldId}-help`} className="ui-field__help">
          {helpText}
        </span>
      )}
      {error && (
        <span id={`${fieldId}-error`} className="ui-field__error">
          {error}
        </span>
      )}
    </label>
  )
}