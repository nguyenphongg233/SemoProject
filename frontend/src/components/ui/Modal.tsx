import type { ReactNode } from 'react'

// 1. Định nghĩa kiểu dữ liệu cho các Props của Modal
interface ModalProps {
  open: boolean
  title: string
  children: ReactNode
  footer?: ReactNode // Vùng footer có thể có hoặc không
  onClose: () => void
}

// 2. Áp dụng vào component
export default function Modal({ open, title, children, footer, onClose }: ModalProps) {
  if (!open) {
    return null
  }

  return (
    <div 
      className="fixed inset-0 z-50 grid place-items-center p-5 
                bg-black/35 dark:bg-bg-accent/75 backdrop-blur-[10px] 
                animate-fade-in duration-180 ease-out" 
      role="presentation" 
      onMouseDown={onClose}
    >
      <div 
        className="w-[min(100%,560px)] rounded-lg border border-border-strong
                  bg-surface-strong backdrop-blur-xl shadow-card theme-transition
                  animate-in fade-in slide-in-from-bottom-3 duration-220 ease-out" 
        role="dialog" 
        aria-modal="true" 
        aria-label={title} 
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-[1.2rem_1.4rem] border-b border-border">
          <h2 className="m-0 text-text-strong">{title}</h2>
          <button 
            type="button" 
            className="w-[2.2rem] h-[2.2rem] border border-border rounded-full 
                      bg-surface-muted text-text-muted cursor-pointer text-[1.2rem] 
                      transition-all duration-180 ease-out 
                      hover:text-brand hover:border-border-glow hover:bg-brand-soft
                      dark:hover:text-white" /* Trả lại chữ trắng khi hover ở Dark mode */
            onClick={onClose} 
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-[1.2rem_1.4rem] text-text">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-[1.2rem_1.4rem] border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}