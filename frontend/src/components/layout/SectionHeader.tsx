import type { ReactNode } from 'react'

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

// 2. Gắn interface vào component
export default function SectionHeader({ eyebrow, title, description, actions }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <p className="section-header__eyebrow">{eyebrow}</p>}
        <h2 className="section-header__title">{title}</h2>
        {description && <p className="section-header__description">{description}</p>}
      </div>
      {actions && <div className="section-header__actions">{actions}</div>}
    </div>
  )
}