import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      // Position menu below the button, right-aligned. 160px = w-40
      setCoords({
        top: rect.bottom + 4,
        left: rect.right - 160
      })
    }
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    
    // Close on any scroll to prevent floating menu from detaching
    function handleScroll() {
      if (isOpen) setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll, true) // capture phase
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        className="p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{ top: coords.top, left: coords.left }}
          className="fixed z-[9999] w-40 origin-top-right bg-slate-800 border border-slate-700 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
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
        </div>,
        document.body
      )}
    </div>
  )
}
