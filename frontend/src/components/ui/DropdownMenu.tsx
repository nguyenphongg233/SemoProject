import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { MoreVertical } from 'lucide-react'
import { cn } from '@/utils'

export interface DropdownMenuItem {
  label: string
  onClick: () => void
  icon?: ReactNode
  danger?: boolean
}

interface DropdownMenuProps {
  items: DropdownMenuItem[]
}

export default function DropdownMenu({ items }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        className="p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 w-40 mt-1 origin-top-right bg-slate-800 border border-slate-700 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
          role="menu"
        >
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                className={cn(
                  "flex w-full items-center px-4 py-2 text-sm text-left transition-colors",
                  item.danger
                    ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                )}
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  item.onClick();
                }}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
