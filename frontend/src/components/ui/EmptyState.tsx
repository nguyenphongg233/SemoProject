import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  className?: string
}

export default function EmptyState({ icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center min-h-[250px] ${className}`}>
      <div className="w-16 h-16 mb-4 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 border border-slate-700/50">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm">{description}</p>}
    </div>
  )
}
