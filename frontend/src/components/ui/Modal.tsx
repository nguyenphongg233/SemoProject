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
    <div className="ui-modal" role="presentation" onMouseDown={onClose}>
      <div 
        className="ui-modal__dialog" 
        role="dialog" 
        aria-modal="true" 
        aria-label={title} 
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="ui-modal__header">
          <h2 className="ui-modal__title">{title}</h2>
          <button type="button" className="ui-modal__close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="ui-modal__body">{children}</div>

        {footer && <div className="ui-modal__footer">{footer}</div>}
      </div>
    </div>
  )
}