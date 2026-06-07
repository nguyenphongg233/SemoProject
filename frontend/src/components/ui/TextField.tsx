import type { InputHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const cn = (...inputs: any[]) => twMerge(clsx(inputs))

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

  const inputClass = cn(
    "w-full min-h-13 p-4 border border-border rounded-[14px]",
    "bg-surface text-text-strong",
    "transition-[border-color,box-shadow,background] duration-200 ease-out",
    "placeholder:text-text-faded",

    "hover:border-border-strong",

    "focus:outline-none focus:border-brand focus:bg-surface-elevated",
    "focus:shadow-[0_0_0_4px_var(--color-brand-soft),0_0_24px_var(--color-brand-soft)]",

    leadingIcon ? "pl-[2.75rem]" : "pl-[1.1rem]",
    trailingAction ? "pr-[2.75rem]" : "pr-[1.1rem]",

    error && "border-color-danger/60 focus:border-color-danger/80 shadow-[0_0_0_4px_rgba(255,92,122,0.12)]"
  )

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
    <label className={cn("grid gap-2", className)} htmlFor={fieldId}>
      {label && <span className="text-sm font-semibold text-(--text)">{label}</span>}

      {leadingIcon || trailingAction ? (
        <div className="relative flex items-center">
          {leadingIcon && (
            <span className="absolute left-3 flex items-center justify-center pointer-events-none text-(--text-muted)">
              {leadingIcon}
            </span>
          )}

          {inputElement}

          {trailingAction && (
            <span className="absolute right-3 flex items-center justify-center pointer-events-auto">
              {trailingAction}
            </span>
          )}
        </div>
      ) : (
        inputElement
      )}

      {helpText && !error && (
        <span id={`${fieldId}-help`} className="text-xs text-(--text-muted)">
          {helpText}
        </span>
      )}

      {error && (
        <span id={`${fieldId}-error`} className="text-xs text-(--danger)">
          {error}
        </span>
      )}
    </label>
  )
}