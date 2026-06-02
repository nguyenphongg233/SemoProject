import type { ReactNode } from 'react'

interface AlertProps {
  children: ReactNode;
  tone?: 'error' | 'success' | string;
  className?: string;
}

export default function Alert({ children, tone = 'error', className = '' }: AlertProps) {
  return <div className={`ui-alert ui-alert--${tone} ${className}`.trim()}>{children}</div>
}