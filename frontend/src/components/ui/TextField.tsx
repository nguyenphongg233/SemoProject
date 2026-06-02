import type { InputHTMLAttributes, ReactNode } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | null
  helpText?: string | null
  leadingIcon?: ReactNode
  trailingAction?: ReactNode
}

export default function TextField({
  label,
  error,
  helpText,
  className = '',
  id,
  leadingIcon = null,
  trailingAction = null,
  ...props
}: TextFieldProps) {
  const fieldId = id || props.name
  const describedBy = [error ? `${fieldId}-error` : null, helpText ? `${fieldId}-help` : null]
    .filter(Boolean)
    .join(' ')

  const inputClass = `ui-input ${error ? 'ui-input--error' : ''}`.trim()

  const inputElement = (
    <input
      id={fieldId}
      className={inputClass}
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy || undefined}
      {...props}
    />
  )

  return (
    <label className={`ui-field ${className}`.trim()} htmlFor={fieldId}>
      {label && <span className="ui-field__label">{label}</span>}

      {leadingIcon || trailingAction ? (
        <div className="input-icon-wrap" style={trailingAction ? { position: 'relative' } : undefined}>
          {leadingIcon && <span className="input-icon-wrap__icon">{leadingIcon}</span>}
          {inputElement}
          {trailingAction && (
            <span
              className="input-icon-wrap__icon"
              style={{ left: 'auto', right: '0.85rem', pointerEvents: 'auto' }}
            >
              {trailingAction}
            </span>
          )}
        </div>
      ) : (
        inputElement
      )}

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