import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
  leadingIcon = null,
  trailingIcon = null,
  ...props
}: ButtonProps) {
  const variantClass = `ui-button--${variant}`

  return (
    <button
      type={type}
      className={`ui-button ${variantClass} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </button>
  )
}
