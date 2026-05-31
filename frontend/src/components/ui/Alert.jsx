// Inline alert banner for user-facing success and error messages.
export default function Alert({ children, tone = 'error', className = '' }) {
  return <div className={`ui-alert ui-alert--${tone} ${className}`.trim()}>{children}</div>
}