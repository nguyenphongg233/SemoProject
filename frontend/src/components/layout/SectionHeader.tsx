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
    <div className="flex justify-between max-sm:flex-col max-sm:items-start">
      <div>
        {eyebrow && (
          <p className="mb-3 text-cyan-soft text-[0.72rem] uppercase tracking-[0.18em] font-bold">
            {eyebrow}
          </p>
        )}
        <h2 className="mb-3 text-2xl text-text-strong">
          {title}
        </h2>
        {description && (
          <p className="text-text-muted leading-[1.6] max-w-[60ch]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center">
          {actions}
        </div>
      )}
    </div>
  )
}