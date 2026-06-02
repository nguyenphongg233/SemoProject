import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'glow' | 'flat' | 'accent' | string
}

export default function Card({ children, className = '', variant = '' }: CardProps) {
  const variantClass = variant ? `ui-card--${variant}` : ''
  return (
    <section className={`ui-card ${variantClass} ${className}`.trim()}>{children}</section>
  )
}