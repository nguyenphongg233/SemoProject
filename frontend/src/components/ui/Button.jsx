// Reusable button with primary/secondary/destructive visual variants.
export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
  ...props
}) {
  const variantClass = `ui-button--${variant}`

  return (
    <button
      type={type}
      className={`ui-button ${variantClass} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}